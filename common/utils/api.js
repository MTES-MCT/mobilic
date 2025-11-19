import React from "react";
import { ApolloClient, ApolloLink, HttpLink } from "@apollo/client";
import ApolloLinkTimeout from "apollo-link-timeout";
import { InMemoryCache } from "@apollo/client/cache";
import { onError } from "@apollo/client/link/error";
import * as Sentry from "@sentry/browser";
import omit from "lodash/omit";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "../store/store";
import { isAuthenticationError, isRetryable } from "./errors";
import { NonConcurrentExecutionQueue } from "./concurrency";
import { buildFCLogoutUrl } from "./franceConnect";
import {
  clearControllerIdCookie,
  clearUserIdCookie,
  currentControllerId,
  currentUserId,
  readCookie
} from "./cookie";
import { MaxSizeCache } from "./cache";
import { saveAs } from "file-saver";
import { CHECK_AUTH_QUERY, HTTP_QUERIES } from "./apiQueries";
import { captureSentryException } from "./sentry";
import { buildAgentConnectLogoutUrl } from "../../web/controller/utils/agentConnect";

export const API_HOST = "/api";

const ApiContext = React.createContext(() => {});

class Api {
  constructor(store = {}, apiHost = API_HOST, graphqlPath = "/graphql") {
    this.apiHost = apiHost;
    this.store = store;
    this.uri = `${apiHost}${graphqlPath}`;
    this.nonPublicUri = `${apiHost}/unexposed`;
    this.apolloClient = null;
    this.displayNonAvailableOfflineModeError = () => {};
    this.recentRequestStatuses = new MaxSizeCache(50);
    this.refreshTokenQueue = new NonConcurrentExecutionQueue();
    this.nonConcurrentQueryQueue = new NonConcurrentExecutionQueue();
    this.isCurrentlySubmittingRequests = () =>
      this.nonConcurrentQueryQueue.queue?.length > 0;
    this.responseHandlers = {};
  }

  initApolloClientIfNeeded() {
    if (!this.apolloClient)
      this.apolloClient = new ApolloClient({
        uri: this.uri,
        link: ApolloLink.from([
          onError((error) => {
            if (isAuthenticationError(error)) {
              this.logout({});
            }
          }),
          new ApolloLinkTimeout(0),
          new ApolloLink((operation, forward) => {
            operation.setContext(({ headers = {} }) => ({
              headers: {
                "X-CLIENT-ID": process.env.REACT_APP_MOBILIC_CLIENT_ID,
                ...headers,
                ...(this.getImpersonationHeaders() || {})
              }
            }));
            return forward(operation);
          }),
          ApolloLink.split(
            (operation) => {
              return !!operation.getContext().nonPublicApi;
            },
            new HttpLink({
              uri: this.nonPublicUri,
              credentials: "same-origin"
            }),
            new HttpLink({ uri: this.uri, credentials: "same-origin" })
          )
        ]),
        cache: new InMemoryCache()
      });
  }

  async graphQlQuery(query, variables, other) {
    this.initApolloClientIfNeeded();
    return await this._queryWithRefreshToken(() =>
      this.apolloClient.query({
        query,
        variables,
        fetchPolicy: "no-cache",
        ...other
      })
    );
  }

  getImpersonationHeaders() {
    const impersonationTokenStack = this.store.state.impersonationTokenStack;
    if (impersonationTokenStack && impersonationTokenStack.length > 0)
      return { "Impersonation-Token": impersonationTokenStack[0] };
    return null;
  }

  async graphQlMutate(query, variables, other, disableRefreshToken = false) {
    this.initApolloClientIfNeeded();
    const func = () =>
      this.apolloClient.mutate({
        mutation: query,
        variables: variables,
        fetchPolicy: "no-cache",
        ...other
      });
    if (disableRefreshToken) {
      return await func();
    }
    return await this._queryWithRefreshToken(func);
  }

  async _fetch(queryInfo, options = {}) {
    const method = queryInfo.method;
    const endpoint = queryInfo.endpoint;
    let url = `${this.apiHost}${endpoint}`;
    options.method = method;
    options.credentials = "same-origin";

    let actualOptions = options;
    if (options.search) {
      url = `${url}${options.search}`;
      actualOptions = omit(options, ["search"]);
    }

    if (actualOptions.json) {
      actualOptions = {
        ...omit(actualOptions, ["json"]),
        headers: {
          ...(actualOptions.headers || {}),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(actualOptions.json)
      };
    }

    const timeout = actualOptions.timeout;
    if (timeout && typeof AbortController !== "undefined") {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...actualOptions,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    }
    return await fetch(url, actualOptions);
  }

  async _parseJson(response) {
    try {
      return await response.json();
    } catch {
      const error = Error("Could not parse JSON");
      error.name = "ServerParseError";
      error._text = await response.text();
      throw error;
    }
  }

  async httpQuery(queryInfo, options = {}, disableRefreshToken = false) {
    const func = async () => {
      const impersonationHeaders = this.getImpersonationHeaders();
      if (impersonationHeaders) {
        options.headers = {
          ...(options.headers || {}),
          ...impersonationHeaders
        };
      }
      options.headers = {
        "X-CLIENT-ID": process.env.REACT_APP_MOBILIC_CLIENT_ID,
        ...options.headers
      };
      const response = await this._fetch(queryInfo, options);
      if (response.status !== 200 && response.status !== 202) {
        const error = new Error("Response status is not 200");
        error.name = "WrongStatusError";
        error.response = response;
        throw error;
      }
      return response;
    };

    if (disableRefreshToken) {
      return await func();
    }
    return await this._queryWithRefreshToken(func);
  }

  async jsonHttpQuery(queryInfo, options = {}, disableRefreshToken = false) {
    const response = await this.httpQuery(
      queryInfo,
      options,
      disableRefreshToken
    );
    return await this._parseJson(response);
  }

  async downloadFileHttpQuery(queryInfo, options = {}) {
    const response = await this.httpQuery(queryInfo, options);
    const blob = await response.blob().catch((err) => console.log(err));
    const fileName = response.headers
      .get("Content-Disposition")
      .split("filename=")[1]
      .split(";")[0];
    saveAs(blob, fileName);
  }

  async _refreshTokenIfNeeded() {
    const accessTokenExpiryTime = parseInt(readCookie("atEat")) || null;
    if (accessTokenExpiryTime) {
      const timeToExpire = accessTokenExpiryTime * 1000 - new Date().getTime();
      if (timeToExpire && timeToExpire < 20000) {
        let refreshResponse;
        try {
          refreshResponse = await this._fetch(HTTP_QUERIES.refresh, {
            timeout: 12000
          });
        } catch (err) {
          const newError = new Error(err.message);
          newError.name = "NetworkError";
          throw newError;
        }
        if (refreshResponse.status !== 200) {
          // User is logged out from the API, update local store
          clearUserIdCookie();
          clearControllerIdCookie();
          await this.store.updateUserIdAndInfo();
          await this.store.updateControllerIdAndInfo();
          this.refreshTokenQueue.clear();
          this.nonConcurrentQueryQueue.clear();
          await broadCastChannel.postMessage("update");
          const hasFcToken = readCookie("hasFc") || false;
          const hasAcToken = readCookie("hasAc") || false;
          if (hasFcToken) {
            window.location.href = buildFCLogoutUrl("/");
          } else if (hasAcToken) {
            window.location.href = buildAgentConnectLogoutUrl("/logout");
          }
          let error;
          let errorName =
            refreshResponse.status === 401
              ? "InvalidRefreshToken"
              : "UnexpectedRefreshTokenError";
          try {
            error = new Error((await this._parseJson(refreshResponse))?.error);
            error.name = errorName;
          } catch (e) {
            error = e;
          }
          error._refreshTokenFailed = true;
          throw error;
        }
      }
    }
  }

  registerResponseHandler(name, handler) {
    this.responseHandlers[name] = handler;
  }

  async _queryWithRefreshToken(query) {
    await this.refreshTokenQueue.execute(() => this._refreshTokenIfNeeded(), {
      cacheKey: "refreshToken"
    });
    return await query();
    // No need to catch the refresh-token error since logout is imminent
  }

  async executeRequest(request) {
    const apiResponseHandler =
      this.responseHandlers[request.apiResponseHandlerName] || {};
    // 0. Resolve temporary IDs if they exist
    const identityMap = this.store.identityMap();
    ["storeInfo", "variables"].forEach((requestProp) => {
      [
        "activityId",
        "missionId",
        "currentActivityId",
        "missionLocationId"
      ].forEach((field) => {
        if (request[requestProp] && identityMap[request[requestProp][field]]) {
          request[requestProp][field] =
            identityMap[request[requestProp][field]];
        }
      });
    });
    try {
      // 1. Call the API
      this.initApolloClientIfNeeded();
      const submit = await this._queryWithRefreshToken(() =>
        this.apolloClient.mutate({
          mutation: request.query,
          variables: request.variables
        })
      );
      // 3. Commit the persistent changes to the store
      if (apiResponseHandler.onSuccess) {
        await apiResponseHandler.onSuccess(submit, request.storeInfo);
      }

      // 4. Remove the temporary updates and the pending request from the pool
      await this.store.clearPendingRequest(request);
      this.recentRequestStatuses.add(request.id, { success: true });
    } catch (err) {
      this.recentRequestStatuses.add(request.id, { error: err });
      if (!this.store.allowOfflineMode || !isRetryable(err)) {
        if (apiResponseHandler.onError)
          await apiResponseHandler.onError(err, request.storeInfo);
        if (isRetryable(err)) {
          await this.displayNonAvailableOfflineModeError();
        }
        await this.store.clearPendingRequest(request);
      }
      Sentry.withScope(function (scope) {
        scope.setContext("request", {
          query: JSON.stringify(request.query),
          variables: request.variables
        });
        captureSentryException(err);
      });
      throw err;
    }
  }

  async executePendingRequests() {
    return await this.nonConcurrentQueryQueue.execute(async () => {
      // 1. Retrieve all pending requests
      let processedRequests = 0;
      while (this.store.pendingRequests().length > 0) {
        try {
          await this.executeRequest(this.store.pendingRequests()[0]);
          processedRequests = processedRequests + 1;
        } catch (err) {
          // We stop early if the error can lead to a retry, otherwise the execution will be stuck in an infinite loop
          if (isRetryable(err)) break;
        }
      }
      this.store.batchUpdate();
      if (processedRequests > 0) {
        await broadCastChannel.postMessage("update");
      }
    });
  }

  async logout({ postFCLogoutRedirect = "/logout", failOnError = true }) {
    this.refreshTokenQueue.clear();
    this.nonConcurrentQueryQueue.clear();
    const hasFcToken = readCookie("hasFc") || false;
    const hasAcToken = readCookie("hasAc") || false;
    if (hasFcToken) {
      window.location.href = buildFCLogoutUrl(postFCLogoutRedirect);
      // Effectively stop JS execution
      const waitUntilLocationChange = new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );
      await waitUntilLocationChange;
    } else if (hasAcToken) {
      window.location.href = buildAgentConnectLogoutUrl(postFCLogoutRedirect);
      const waitUntilLocationChange = new Promise((resolve) =>
        setTimeout(resolve, 5000)
      );
      await waitUntilLocationChange;
    } else {
      if (currentUserId() || currentControllerId()) {
        try {
          await this.nonConcurrentQueryQueue.execute(
            async () =>
              await this._fetch(HTTP_QUERIES.logout, {
                timeout: 8000
              })
          );
        } catch (err) {
          if (failOnError) throw err;
        }
        clearUserIdCookie();
        clearControllerIdCookie();
        await this.store.updateUserIdAndInfo();
        await this.store.updateControllerIdAndInfo();
        await broadCastChannel.postMessage("update");
      }
    }
  }

  async checkAuthentication() {
    const userId = currentUserId();
    if (!userId) return false;
    try {
      const response = await this.graphQlQuery(CHECK_AUTH_QUERY);
      return response.data.checkAuth.userId === userId;
    } catch (err) {
      return false;
    }
  }
}

const api = new Api();

export function ApiContextProvider({ children }) {
  api.store = useStoreSyncedWithLocalStorage();
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export const useApi = () => React.useContext(ApiContext);
