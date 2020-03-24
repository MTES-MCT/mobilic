import React from "react";
import { useHistory } from "react-router-dom";
import ApolloClient, { gql } from "apollo-boost";
import jwtDecode from "jwt-decode";
import { useStoreSyncedWithLocalStorage } from "./store";
import { isGraphQLParsingError } from "./errors";

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
      }
      enrollableCoworkers {
        id
        firstName
        lastName
      }
      teamEnrollments {
        id
        userId
        type
        actionTime
      }
      activities {
        id
        type
        startTime
        team
        mission
        vehicleRegistrationNumber
        driverId
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
        startTime
        team
        mission
        vehicleRegistrationNumber
        driverId
      }
      teamEnrollments {
        id
        userId
        type
        actionTime
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

export const EXPENDITURE_CANCEL_MUTATION = gql`
  mutation($data: [CancelEventInput]!) {
    cancelExpenditures(data: $data) {
      expenditures {
        id
        type
        eventTime
      }
    }
  }
`;

export const ACTIVITY_CANCEL_MUTATION = gql`
  mutation($data: [CancelEventInput]!) {
    cancelActivities(data: $data) {
      activities {
        id
        type
        startTime
        team
        mission
        vehicleRegistrationNumber
        driverId
      }
    }
  }
`;

export const ACTIVITY_REVISION_MUTATION = gql`
  mutation($data: [ActivityRevisionInput]!) {
    reviseActivities(data: $data) {
      activities {
        id
        type
        startTime
        team
        mission
        vehicleRegistrationNumber
        driverId
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

export const TEAM_ENROLLMENT_LOG_MUTATION = gql`
  mutation($data: [SingleTeamEnrollmentInput]!) {
    logTeamEnrollments(data: $data) {
      enrollableCoworkers {
        id
        firstName
        lastName
      }
      teamEnrollments {
        id
        userId
        type
        actionTime
      }
    }
  }
`;

export const MISSION_LOG_MUTATION = gql`
  mutation($data: [MissionInput]!) {
    logMissions(data: $data) {
      missions {
        name
        startTime
      }
    }
  }
`;

const ApiContext = React.createContext(() => {});

class Api {
  constructor(
    storeSyncedWithLocalStorage = {},
    apiHost = process.env.REACT_APP_API_HOST || "/api",
    history = {},
    graphqlPath = "/graphql"
  ) {
    this.apiHost = apiHost;
    this.storeSyncedWithLocalStorage = storeSyncedWithLocalStorage;
    this.history = history;
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

  async _nonConcurrentQuery(func) {
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
    return this._nonConcurrentQuery(() =>
      this.apolloClient.query({ query, variables, fetchPolicy: "no-cache" })
    );
  }

  async graphQlMutate(query, variables) {
    return this._nonConcurrentQuery(() =>
      this.apolloClient.mutate({
        mutation: query,
        variables: variables,
        fetchPolicy: "no-cache"
      })
    );
  }

  async httpQuery(method, endpoint, options = {}) {
    return this._nonConcurrentQuery(() => {
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

  submitEvents(query, storeEntry, handleSubmitResponse) {
    return this._nonConcurrentQuery(async () => {
      const eventsPendingSubmission = await this.storeSyncedWithLocalStorage.markAndGetEventsForSubmission(
        storeEntry
      );
      if (eventsPendingSubmission.length === 0) return;
      try {
        const submit = await this.apolloClient.mutate({
          mutation: query,
          variables: {
            data: eventsPendingSubmission.map(e => {
              const { isBeingSubmitted, ...event } = e;
              return event;
            })
          }
        });
        await handleSubmitResponse(submit);
      } catch (err) {
        if (isGraphQLParsingError(err)) {
          await this.storeSyncedWithLocalStorage.removeEventsAfterFailedSubmission(
            storeEntry
          );
        } else {
          await this.storeSyncedWithLocalStorage.removeSubmissionMark(
            storeEntry
          );
        }
      }
    });
  }

  async logout() {
    await this.storeSyncedWithLocalStorage.removeTokens();
    this.history.push("/");
  }
}

const api = new Api();

export function ApiContextProvider({ children }) {
  api.storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  api.history = useHistory();
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export const useApi = () => React.useContext(ApiContext);
