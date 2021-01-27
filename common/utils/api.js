import React from "react";
import forEach from "lodash/forEach";
import { ApolloClient, HttpLink, ApolloLink, gql } from "@apollo/client";
import ApolloLinkTimeout from "apollo-link-timeout";
import { InMemoryCache } from "@apollo/client/cache";
import { onError } from "@apollo/client/link/error";
import { BatchHttpLink } from "@apollo/client/link/batch-http";
import * as Sentry from "@sentry/browser";
import { useStoreSyncedWithLocalStorage, broadCastChannel } from "./store";
import { isAuthenticationError, isRetryable } from "./errors";
import { NonConcurrentExecutionQueue } from "./concurrency";
import { buildFCLogoutUrl } from "./franceConnect";
import { currentUserId, readCookie, clearUserIdCookie } from "./cookie";

export const API_HOST = "/api";

const CHECK_MUTATION = gql`
  mutation checkAuthentication {
    auth {
      check {
        success
        userId
      }
    }
  }
`;

export const LOGIN_MUTATION_STRING = `mutation login($email: String!, $password: String!) {
  auth {
    login(email: $email, password: $password) {
      accessToken
      refreshToken
    }
  }
}
`;

export const LOGIN_MUTATION = gql`
  ${LOGIN_MUTATION_STRING}
`;

export const USER_SIGNUP_MUTATION = gql`
  mutation userSignUp(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $inviteToken: String
  ) {
    signUp {
      user(
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
        inviteToken: $inviteToken
      ) {
        accessToken
        refreshToken
      }
    }
  }
`;

export const CONFIRM_FC_EMAIL_MUTATION = gql`
  mutation confirmFcEmail($email: String!, $password: String) {
    signUp {
      confirmFcEmail(email: $email, password: $password) {
        email
        hasConfirmedEmail
      }
    }
  }
`;

export const COMPANY_SIGNUP_MUTATION = gql`
  mutation companySignUp($siren: Int!, $usualName: String!, $sirets: [String]) {
    signUp {
      company(siren: $siren, usualName: $usualName, sirets: $sirets) {
        employment {
          id
          startDate
          isAcknowledged
          isPrimary
          hasAdminRights
          company {
            id
            name
          }
        }
      }
    }
  }
`;

export const SIREN_QUERY = gql`
  query sirenInfo($siren: Int!) {
    sirenInfo(siren: $siren)
  }
`;

export const USER_QUERY = gql`
  query user($id: Int!, $activityAfter: TimeStamp) {
    user(id: $id) {
      id
      firstName
      lastName
      birthDate
      email
      hasConfirmedEmail
      hasActivatedEmail
      primaryCompany {
        id
        name
        users {
          id
          firstName
          lastName
        }
        vehicles {
          id
          name
        }
      }
      missions(fromTime: $activityAfter) {
        id
        name
        validations {
          submitterId
          receptionTime
          isAdmin
          userId
        }
        context
        expenditures {
          id
          type
          missionId
          userId
        }
        activities {
          id
          type
          missionId
          startTime
          endTime
          userId
        }
        comments {
          id
          text
          missionId
          receptionTime
          submitter {
            id
            firstName
            lastName
          }
        }
      }
      currentEmployments {
        id
        startDate
        isAcknowledged
        isPrimary
        hasAdminRights
        company {
          id
          name
        }
      }
    }
  }
`;

export const ADMIN_COMPANIES_QUERY = gql`
  query adminCompanies(
    $id: Int!
    $activityAfter: Date
    $workDaysLimit: Int
    $nonValidatedMissionsAfter: Date
  ) {
    user(id: $id) {
      adminedCompanies {
        id
        name
        users {
          id
          firstName
          lastName
        }
        workDays(fromDate: $activityAfter, limit: $workDaysLimit) {
          user {
            id
            firstName
            lastName
          }
          startTime
          endTime
          expenditures
          serviceDuration
          totalWorkDuration
          activityDurations
        }
        missions(
          fromTime: $nonValidatedMissionsAfter
          onlyNonValidatedMissions: true
        ) {
          id
          name
          validations {
            submitterId
            receptionTime
          }
          context
          expenditures {
            id
            type
            userId
          }
          activities {
            id
            type
            startTime
            endTime
            user {
              id
              firstName
              lastName
            }
          }
          comments {
            id
            text
            receptionTime
            submitter {
              id
              firstName
              lastName
            }
          }
        }
        vehicles {
          id
          registrationNumber
          alias
        }
        employments {
          id
          startDate
          endDate
          isAcknowledged
          isPrimary
          email
          hasAdminRights
          user {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const GET_EMPLOYMENT_QUERY = gql`
  query getInvitation($token: String!) {
    employment(token: $token) {
      id
      startDate
      isPrimary
      hasAdminRights
      company {
        id
        name
      }
      userId
      submitter {
        id
        firstName
        lastName
      }
    }
  }
`;

export const REDEEM_INVITE_QUERY = gql`
  mutation redeemInvite($token: String!) {
    signUp {
      redeemInvite(token: $token) {
        id
        startDate
        isPrimary
        isAcknowledged
        hasAdminRights
        company {
          id
          name
        }
      }
    }
  }
`;

export const CHANGE_EMAIL_MUTATION = gql`
  mutation changeEmail($email: String!) {
    account {
      changeEmail(email: $email) {
        email
        hasConfirmedEmail
        hasActivatedEmail
      }
    }
  }
`;

export const RESET_PASSWORD_MUTATION = gql`
  mutation resetPassword($token: String!, $password: String!) {
    account {
      resetPassword(token: $token, password: $password) {
        id
      }
    }
  }
`;

export const REQUEST_RESET_PASSWORD_MUTATION = gql`
  mutation requestResetPassword($mail: String!) {
    account {
      requestResetPassword(mail: $mail) {
        success
      }
    }
  }
`;

export const ACTIVATE_EMAIL_MUTATION = gql`
  mutation activateEmail($token: String!) {
    signUp {
      activateEmail(token: $token) {
        hasActivatedEmail
      }
    }
  }
`;

export const FRANCE_CONNECT_LOGIN_MUTATION = gql`
  mutation franceConnectLogin(
    $authorizationCode: String!
    $originalRedirectUri: String!
    $inviteToken: String
    $create: Boolean
    $state: String!
  ) {
    auth {
      franceConnectLogin(
        authorizationCode: $authorizationCode
        originalRedirectUri: $originalRedirectUri
        inviteToken: $inviteToken
        create: $create
        state: $state
      ) {
        accessToken
        refreshToken
        fcToken
      }
    }
  }
`;

export const VALIDATE_EMPLOYMENT_MUTATION = gql`
  mutation validateEmployment($employmentId: Int!) {
    employments {
      validateEmployment(employmentId: $employmentId) {
        id
        startDate
        isAcknowledged
        isPrimary
        hasAdminRights
        company {
          id
          name
        }
      }
    }
  }
`;

export const REJECT_EMPLOYMENT_MUTATION = gql`
  mutation rejectEmployment($employmentId: Int!) {
    employments {
      rejectEmployment(employmentId: $employmentId) {
        id
        startDate
        isAcknowledged
        hasAdminRights
        company {
          id
          name
        }
      }
    }
  }
`;

export const CANCEL_EMPLOYMENT_MUTATION = gql`
  mutation cancelEmployment($employmentId: Int!) {
    employments {
      cancelEmployment(employmentId: $employmentId) {
        success
      }
    }
  }
`;

export const TERMINATE_EMPLOYMENT_MUTATION = gql`
  mutation terminateEmployment($employmentId: Int!, $endDate: Date) {
    employments {
      terminateEmployment(employmentId: $employmentId, endDate: $endDate) {
        id
        startDate
        endDate
        isAcknowledged
        isPrimary
        email
        hasAdminRights
        company {
          id
          name
        }
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const CREATE_EMPLOYMENT_MUTATION = gql`
  mutation createEmployment(
    $userId: Int
    $companyId: Int!
    $hasAdminRights: Boolean
    $mail: String
  ) {
    employments {
      createEmployment(
        userId: $userId
        companyId: $companyId
        hasAdminRights: $hasAdminRights
        mail: $mail
      ) {
        id
        startDate
        endDate
        isAcknowledged
        isPrimary
        email
        hasAdminRights
        company {
          id
          name
        }
        user {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const LOG_ACTIVITY_MUTATION = gql`
  mutation logActivity(
    $type: ActivityTypeEnum!
    $startTime: TimeStamp!
    $endTime: TimeStamp
    $missionId: Int!
    $userId: Int
    $context: GenericScalar
    $switch: Boolean
  ) {
    activities {
      logActivity(
        type: $type
        startTime: $startTime
        endTime: $endTime
        missionId: $missionId
        userId: $userId
        context: $context
        switch: $switch
      ) {
        id
        type
        userId
        missionId
        startTime
        endTime
      }
    }
  }
`;

export const CANCEL_ACTIVITY_MUTATION = gql`
  mutation cancelActivity($activityId: Int!, $context: GenericScalar) {
    activities {
      cancelActivity(activityId: $activityId, context: $context) {
        success
      }
    }
  }
`;

export const EDIT_ACTIVITY_MUTATION = gql`
  mutation editActivity(
    $activityId: Int!
    $context: GenericScalar
    $startTime: TimeStamp
    $endTime: TimeStamp
    $removeEndTime: Boolean
  ) {
    activities {
      editActivity(
        activityId: $activityId
        startTime: $startTime
        endTime: $endTime
        context: $context
        removeEndTime: $removeEndTime
      ) {
        id
        type
        missionId
        userId
        startTime
        endTime
      }
    }
  }
`;

export const IS_MISSION_ENDED_QUERY = gql`
  query isMissionEnded($missionId: Int!) {
    isMissionEndedForSelf(missionId: $missionId)
  }
`;

export const CREATE_MISSION_MUTATION = gql`
  mutation createMission(
    $name: String
    $companyId: Int
    $context: GenericScalar
  ) {
    activities {
      createMission(name: $name, companyId: $companyId, context: $context) {
        id
        name
        context
      }
    }
  }
`;

export const END_MISSION_MUTATION = gql`
  mutation endMission($endTime: TimeStamp!, $missionId: Int!, $userId: Int) {
    activities {
      endMission(endTime: $endTime, missionId: $missionId, userId: $userId) {
        id
        name
        context
        activities {
          id
          type
          missionId
          userId
          startTime
          endTime
        }
      }
    }
  }
`;

export const CREATE_VEHICLE_MUTATION = gql`
  mutation createVehicle(
    $registrationNumber: String!
    $alias: String
    $companyId: Int!
  ) {
    vehicles {
      createVehicle(
        registrationNumber: $registrationNumber
        alias: $alias
        companyId: $companyId
      ) {
        id
        registrationNumber
        alias
      }
    }
  }
`;

export const EDIT_VEHICLE_MUTATION = gql`
  mutation($id: Int!, $alias: String!) {
    vehicles {
      editVehicle(id: $id, alias: $alias) {
        id
        registrationNumber
        alias
      }
    }
  }
`;

export const TERMINATE_VEHICLE_MUTATION = gql`
  mutation terminateVehicle($id: Int!) {
    vehicles {
      terminateVehicle(id: $id) {
        success
      }
    }
  }
`;

export const VALIDATE_MISSION_MUTATION = gql`
  mutation validateMission($missionId: Int!) {
    activities {
      validateMission(missionId: $missionId) {
        mission {
          id
          name
          context
        }
      }
    }
  }
`;

export const LOG_EXPENDITURE_MUTATION = gql`
  mutation logExpenditure(
    $type: ExpenditureTypeEnum!
    $missionId: Int!
    $userId: Int
  ) {
    activities {
      logExpenditure(type: $type, missionId: $missionId, userId: $userId) {
        id
        type
        missionId
        userId
      }
    }
  }
`;

export const CANCEL_EXPENDITURE_MUTATION = gql`
  mutation cancelExpenditure($expenditureId: Int!) {
    activities {
      cancelExpenditure(expenditureId: $expenditureId) {
        success
      }
    }
  }
`;

export const LOG_COMMENT_MUTATION = gql`
  mutation logComment($text: String!, $missionId: Int!) {
    activities {
      logComment(text: $text, missionId: $missionId) {
        id
        text
        missionId
        receptionTime
        submitter {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const CANCEL_COMMENT_MUTATION = gql`
  mutation cancelComment($commentId: Int!) {
    activities {
      cancelComment(commentId: $commentId) {
        success
      }
    }
  }
`;

const ApiContext = React.createContext(() => {});

class Api {
  constructor(store = {}, apiHost = API_HOST, graphqlPath = "/graphql") {
    this.apiHost = apiHost;
    this.store = store;
    const uri = `${apiHost}${graphqlPath}`;
    const nonPublicUri = `${apiHost}/unexposed`;
    this.apolloClient = new ApolloClient({
      uri: `${apiHost}${graphqlPath}`,
      link: ApolloLink.from([
        onError(error => {
          if (isAuthenticationError(error)) {
            this.logout({});
          }
        }),
        new ApolloLinkTimeout(0),
        ApolloLink.split(
          operation => {
            return !!operation.getContext().nonPublicApi;
          },
          new HttpLink({ uri: nonPublicUri, credentials: "same-origin" }),
          ApolloLink.split(
            operation => !!operation.getContext().batchable,
            new BatchHttpLink({ uri, credentials: "same-origin" }),
            new HttpLink({ uri, credentials: "same-origin" })
          )
        )
      ]),
      cache: new InMemoryCache()
    });
    this.refreshTokenQueue = new NonConcurrentExecutionQueue();
    this.nonConcurrentQueryQueue = new NonConcurrentExecutionQueue();
    this.isCurrentlySubmittingRequests = () =>
      this.nonConcurrentQueryQueue.queue.length > 0;
    this.responseHandlers = {};
    window.addEventListener("online", () => this.executePendingRequests());
  }

  async graphQlQuery(query, variables, other) {
    return await this._queryWithRefreshToken(() =>
      this.apolloClient.query({
        query,
        variables,
        fetchPolicy: "no-cache",
        ...other
      })
    );
  }

  async graphQlMutate(query, variables, other) {
    return await this._queryWithRefreshToken(() =>
      this.apolloClient.mutate({
        mutation: query,
        variables: variables,
        fetchPolicy: "no-cache",
        ...other
      })
    );
  }

  async _fetch(method, endpoint, options = {}) {
    const url = `${this.apiHost}${endpoint}`;
    options.method = method;
    options.credentials = "same-origin";

    const timeout = options.timeout;
    if (timeout && typeof AbortController !== "undefined") {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(id);
      return response;
    }
    return await fetch(url, options);
  }

  async httpQuery(method, endpoint, options = {}) {
    return await this._queryWithRefreshToken(() =>
      this._fetch(method, endpoint, options)
    );
  }

  async _refreshTokenIfNeeded() {
    const accessTokenExpiryTime = parseInt(readCookie("atEat")) || null;
    if (accessTokenExpiryTime) {
      const timeToExpire = accessTokenExpiryTime * 1000 - new Date().getTime();
      if (timeToExpire && timeToExpire < 10000) {
        let refreshResponse;
        try {
          refreshResponse = await this._fetch("POST", "/token/refresh", {
            timeout: 8000
          });
        } catch (err) {
          const newError = new Error(err.message);
          newError.name = "NetworkError";
          throw newError;
        }
        if (refreshResponse.status !== 200) {
          // User is logged out from the API, update local store
          clearUserIdCookie();
          await this.store.updateUserIdAndInfo();
          this.refreshTokenQueue.clear();
          this.nonConcurrentQueryQueue.clear();
          await broadCastChannel.postMessage("update");
          const hasFcToken = readCookie("hasFc") || false;
          if (hasFcToken) {
            window.location.href = buildFCLogoutUrl("/");
          }
          const errorMessage = refreshResponse.json().error;
          const error = new Error(errorMessage);
          error.name = "RefreshTokenError";
          throw error;
        }
      }
    }
  }

  registerResponseHandler(name, handler) {
    this.responseHandlers[name] = handler;
  }

  async _queryWithRefreshToken(query) {
    await this.refreshTokenQueue.execute(
      () => this._refreshTokenIfNeeded(),
      "refreshToken"
    );
    return await query();
    // No need to catch the refresh-token error since logout is imminent
  }

  async executeRequest(request) {
    const apiResponseHandler =
      this.responseHandlers[request.apiResponseHandlerName] || {};
    // 0. Resolve temporary IDs if they exist
    const identityMap = this.store.identityMap();
    ["storeInfo", "variables"].forEach(requestProp => {
      ["activityId", "missionId", "currentActivityId"].forEach(field => {
        if (request[requestProp] && identityMap[request[requestProp][field]]) {
          request[requestProp][field] =
            identityMap[request[requestProp][field]];
        }
      });
    });
    try {
      // 1. Call the API
      const submit = await this._queryWithRefreshToken(() =>
        this.apolloClient.mutate({
          mutation: request.query,
          variables: request.variables,
          context: { batchable: request.batchable }
        })
      );
      // 3. Commit the persistent changes to the store
      if (apiResponseHandler.onSuccess) {
        await apiResponseHandler.onSuccess(submit, request.storeInfo);
      }

      // 4. Remove the temporary updates and the pending request from the pool
      await this.store.clearPendingRequest(request);
    } catch (err) {
      if (!isRetryable(err)) {
        if (apiResponseHandler.onError)
          await apiResponseHandler.onError(err, request.storeInfo);
        await this.store.clearPendingRequest(request);
      }
      Sentry.withScope(function(scope) {
        scope.setTag("request_query", JSON.stringify(request.query));
        scope.setTag("request_variables", JSON.stringify(request.variables));
        Sentry.captureException(err);
      });
      throw err;
    }
  }

  async executePendingRequests(failOnError = false) {
    return await this.nonConcurrentQueryQueue.execute(async () => {
      // 1. Retrieve all pending requests
      let requestExecutionResults = {};
      let processedRequests = 0;
      while (this.store.pendingRequests().length > 0) {
        let errors = [];
        const pendingRequests = this.store.pendingRequests();
        const batch = [];
        forEach(pendingRequests, request => {
          // Match Apollo batch size to ensure sequential execution
          if (request.batchable && batch.length < 10) batch.push(request);
          else {
            if (batch.length === 0) batch.push(request);
            return false;
          }
        });
        await Promise.all(
          batch.map(async request => {
            try {
              await this.executeRequest(request);
              processedRequests = processedRequests + 1;
              requestExecutionResults[request.id] = { success: true };
            } catch (err) {
              // It is important to wait for ALL the batched request handlers to execute
              // because they are all processed by the API regardless of whether the others fail
              // So we avoid throwing an error here, otherwise the other successful promises could be cancelled
              requestExecutionResults[request.id] = { error: err };
              errors.push(err);
            }
          })
        );
        if (errors.length > 0) {
          if (failOnError) throw errors[0];
          // We stop early if some errors can lead to a retry, otherwise the execution will be stuck in an infinite loop
          if (errors.some(e => isRetryable(e))) {
            break;
          }
        }
      }
      if (processedRequests > 0) {
        await broadCastChannel.postMessage("update");
      }
      return requestExecutionResults;
    });
  }

  async logout({ postFCLogoutRedirect = "/logout", failOnError = true }) {
    this.refreshTokenQueue.clear();
    this.nonConcurrentQueryQueue.clear();
    const hasFcToken = readCookie("hasFc") || false;
    if (hasFcToken) {
      window.location.href = buildFCLogoutUrl(postFCLogoutRedirect);
      // Effectively stop JS execution
      const waitUntilLocationChange = new Promise(resolve =>
        setTimeout(resolve, 5000)
      );
      await waitUntilLocationChange;
    } else {
      if (currentUserId()) {
        try {
          await this.nonConcurrentQueryQueue.execute(
            async () =>
              await this._fetch("POST", "/token/logout", { timeout: 8000 })
          );
        } catch (err) {
          if (failOnError) throw err;
        }
        clearUserIdCookie();
        await this.store.updateUserIdAndInfo();
        await broadCastChannel.postMessage("update");
      }
    }
  }

  async checkAuthentication() {
    const userId = currentUserId();
    if (!userId) return false;
    try {
      const response = await this.graphQlQuery(CHECK_MUTATION);
      return response.data.auth.check.userId === userId;
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
