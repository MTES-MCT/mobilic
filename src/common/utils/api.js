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
        companyId
        team
        mission
        vehicleRegistrationNumber
        driverIdx
      }
      expenditures {
        type
        eventTime
      }
      comments {
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
        companyId
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
        companyId
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
        companyId
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
    apiHost = process.env.REACT_APP_API_HOST || "http://192.168.1.38:5000",
    graphqlPath = "/api/graphql",
    apiRootPath = "/api"
  ) {
    this.apiUrl = `${apiHost}${apiRootPath}`;
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
        await this._refreshTokenIfNeeded();
        try {
          response = await func();
        } catch (err) {
          console.log(`Error accessing API : ${err}`);
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
      const url = `${this.apiUrl}${endpoint}`;
      if (!options.headers) options.headers = {};
      options.headers.Authorization = `Bearer ${this.storeSyncedWithLocalStorage.accessToken()}`;
      options.headers.Origin = `http://localhost:3000/`;
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
      } catch (err) {
        console.log(`Error refreshing tokens : ${err}`);
      }
    }
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
