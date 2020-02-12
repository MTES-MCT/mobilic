import ApolloClient, { gql } from "apollo-boost";
import jwtDecode from "jwt-decode";

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

class Api {
  constructor(
    apiHost = process.env.REACT_APP_API_HOST || "http://192.168.1.38:5000",
    graphqlPath = "/api/graphql",
    apiRootPath = "/api",
    accessTokenKey = "accessToken",
    refreshTokenKey = "refreshToken"
  ) {
    this.apiUrl = `${apiHost}${apiRootPath}`;
    this.accessTokenKey = accessTokenKey;
    this.refreshTokenKey = refreshTokenKey;
    this.apolloClient = new ApolloClient({
      uri: `${apiHost}${graphqlPath}`,
      request: operation => {
        const tokenType =
          operation.operationName === "refreshToken"
            ? refreshTokenKey
            : accessTokenKey;
        const token = localStorage.getItem(tokenType);
        operation.setContext({
          headers: {
            authorization: token ? `Bearer ${token}` : ""
          }
        });
      }
    });
  }

  graphQlQuery(query, variables) {
    this._refreshTokenIfNeeded();
  }

  graphQlMutate(query, variables) {
    this._refreshTokenIfNeeded();
    return this.apolloClient.mutate({ mutation: query, variables: variables });
  }

  httpQuery(method, endpoint, options) {
    return 3;
  }

  async _refreshTokenIfNeeded() {
    const accessToken = localStorage.getItem(this.accessTokenKey);
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const timeToExpire =
          decodedToken.exp && decodedToken.exp * 1000 - new Date().getTime();
        if (timeToExpire && timeToExpire < 10000) {
          const tokens = await this.apolloClient.mutate({
            mutation: REFRESH_MUTATION
          });
          console.log(tokens);
        }
      } catch {
        console.log("Error");
      }
    }
  }

  clearTokens() {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  saveTokens(accessToken, refreshToken) {
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }
}

export const api = new Api();
