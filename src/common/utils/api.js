import React from "react";
import ApolloClient, { gql } from "apollo-boost";
import jwtDecode from "jwt-decode";
import { useLocalStorage } from "./storage";

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

const ApiContext = React.createContext(() => {});

class Api {
  constructor(
    localStorageContext = {},
    apiHost = process.env.REACT_APP_API_HOST || "http://192.168.1.38:5000",
    graphqlPath = "/api/graphql",
    apiRootPath = "/api"
  ) {
    this.apiUrl = `${apiHost}${apiRootPath}`;
    this.localStorageContext = localStorageContext;
    this.apolloClient = new ApolloClient({
      uri: `${apiHost}${graphqlPath}`,
      request: operation => {
        const token =
          operation.operationName === "refreshToken"
            ? this.localStorageContext.getRefreshToken()
            : this.localStorageContext.getAccessToken();
        operation.setContext({
          headers: {
            authorization: token ? `Bearer ${token}` : ""
          }
        });
      }
    });
  }

  async graphQlQuery(query, variables) {
    this._refreshTokenIfNeeded();
    return this.apolloClient.query({ query, variables });
  }

  async graphQlMutate(query, variables) {
    this._refreshTokenIfNeeded();
    return this.apolloClient.mutate({ mutation: query, variables: variables });
  }

  async httpQuery(method, endpoint, options) {
    this._refreshTokenIfNeeded();
  }

  async _refreshTokenIfNeeded() {
    const accessToken = this.localStorageContext.getAccessToken();
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const timeToExpire =
          decodedToken.exp && decodedToken.exp * 1000 - new Date().getTime();
        if (timeToExpire && timeToExpire < 10000) {
          const refreshResponse = await this.apolloClient.mutate({
            mutation: REFRESH_MUTATION
          });
          this.localStorageContext.storeTokens(refreshResponse.auth.refresh);
        }
      } catch {
        console.log("Error refreshing tokens");
      }
    }
  }

  logout() {
    this.localStorageContext.removeTokens();
  }
}

const api = new Api();

export function ApiContextProvider({ children }) {
  api.localStorageContext = useLocalStorage();
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export const useApi = () => React.useContext(ApiContext);
