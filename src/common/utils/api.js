import React from "react";
import ApolloClient, { gql } from "apollo-boost";
import jwtDecode from "jwt-decode";
import { useStoreSyncedWithLocalStorage } from "./store";

const REFRESH_MUTATION = gql`
  mutation refreshToken {
    auth {
      refresh {
        accessToken
        refreshToken
      }
    }
  }
`;

export const LOGIN_MUTATION = gql`
  mutation($email: String!, $password: String!) {
    auth {
      login(email: $email, password: $password) {
        accessToken
        refreshToken
      }
    }
  }
`;

export const USER_SIGNUP_MUTATION = gql`
  mutation(
    $email: String!
    $password: String!
    $firstName: String!
    $lastName: String!
    $companyName: String!
  ) {
    signupUser(
      email: $email
      password: $password
      firstName: $firstName
      lastName: $lastName
      companyNameToResolve: $companyName
    ) {
      user {
        id
        firstName
        lastName
      }
      accessToken
      refreshToken
    }
  }
`;

export const USER_QUERY = gql`
  query($id: Int!) {
    user(id: $id) {
      id
      firstName
      lastName
      company {
        id
        name
        users {
          id
          firstName
          lastName
        }
      }
      activities {
        id
        type
        eventTime
        team
        mission
        vehicleRegistrationNumber
        driverIdx
      }
      expenditures {
        id
        type
        eventTime
      }
      comments {
        id
        content
        eventTime
      }
    }
  }
`;

export const ACTIVITY_LOG_MUTATION = gql`
  mutation($data: [SingleActivityInput]!) {
    logActivities(data: $data) {
      activities {
        id
        type
        eventTime
        team
        mission
        vehicleRegistrationNumber
        driverIdx
      }
      company {
        users {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const EXPENDITURE_LOG_MUTATION = gql`
  mutation($data: [SingleExpenditureInput]!) {
    logExpenditures(data: $data) {
      expenditures {
        id
        type
        eventTime
      }
    }
  }
`;

export const COMMENT_LOG_MUTATION = gql`
  mutation($data: [CommentInput]!) {
    logComments(data: $data) {
      comments {
        id
        content
        eventTime
      }
    }
  }
`;

const ApiContext = React.createContext(() => {});

class Api {
  constructor(
    storeSyncedWithLocalStorage = {},
    apiHost = process.env.REACT_APP_API_HOST || "/api",
    graphqlPath = "/graphql"
  ) {
    this.apiHost = apiHost;
    this.storeSyncedWithLocalStorage = storeSyncedWithLocalStorage;
    this.apolloClient = new ApolloClient({
      uri: `${apiHost}${graphqlPath}`,
      request: operation => {
        const token =
          operation.operationName === "refreshToken"
            ? this.storeSyncedWithLocalStorage.refreshToken()
            : this.storeSyncedWithLocalStorage.accessToken();
        operation.setContext({
          headers: {
            authorization: token ? `Bearer ${token}` : ""
          }
        });
      },
      onError: ({ operation, response, graphQLErrors, networkError }) => {
        if (
          graphQLErrors &&
          graphQLErrors.length > 0 &&
          graphQLErrors.some(error => error.message === "Authentication error")
        ) {
          this.requestQueue = [];
          this.requestLock = false;
          this.logout();
        }
      }
    });
    this.requestQueue = [];
    this.requestLock = false;
  }

  async _query(func) {
    return new Promise((resolve, reject) => {
      const runQuery = async () => {
        this.requestLock = true;
        let response, error;
        const isTokenValidOrRenewedOrNone = await this._refreshTokenIfNeeded();
        if (isTokenValidOrRenewedOrNone) {
          try {
            response = await func();
          } catch (err) {
            error = err;
            console.log(`Error accessing API : ${err}`);
          }
        }
        if (this.requestQueue.length === 0) {
          this.requestLock = false;
        } else {
          this.requestQueue[0]();
          this.requestQueue = this.requestQueue.slice(1);
        }
        return error ? reject(error) : resolve(response);
      };
      if (!this.requestLock) runQuery();
      else this.requestQueue.push(runQuery);
    });
  }

  async graphQlQuery(query, variables) {
    return this._query(() => this.apolloClient.query({ query, variables }));
  }

  async graphQlMutate(query, variables) {
    return this._query(() =>
      this.apolloClient.mutate({ mutation: query, variables: variables })
    );
  }

  async httpQuery(method, endpoint, options = {}) {
    return this._query(() => {
      const url = `${this.apiHost}${endpoint}`;
      if (!options.headers) options.headers = {};
      options.headers.Authorization = `Bearer ${this.storeSyncedWithLocalStorage.accessToken()}`;
      options.method = method;
      return fetch(url, options);
    });
  }

  async _refreshTokenIfNeeded() {
    const accessToken = this.storeSyncedWithLocalStorage.accessToken();
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const timeToExpire =
          decodedToken.exp && decodedToken.exp * 1000 - new Date().getTime();
        if (timeToExpire && timeToExpire < 10000) {
          const refreshResponse = await this.apolloClient.mutate({
            mutation: REFRESH_MUTATION
          });
          await this.storeSyncedWithLocalStorage.storeTokens(
            refreshResponse.data.auth.refresh
          );
        }
        return true;
      } catch (err) {
        console.log(`Error refreshing tokens : ${err}`);
        return false;
      }
    }
    return true;
  }

  logout() {
    this.storeSyncedWithLocalStorage.removeTokens();
  }
}

const api = new Api();

export function ApiContextProvider({ children }) {
  api.storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export const useApi = () => React.useContext(ApiContext);
