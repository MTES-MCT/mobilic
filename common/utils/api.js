import React from "react";
import ApolloClient, { gql } from "apollo-boost";
import jwtDecode from "jwt-decode";
import { useStoreSyncedWithLocalStorage } from "./store";
import { isGraphQLParsingError } from "./errors";
import { NonConcurrentExecutionQueue } from "./concurrency";

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
      isCompanyAdmin
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
        userTime
      }
      activities {
        id
        type
        userTime
        driverId
      }
      expenditures {
        id
        type
        eventTime
      }
      missions {
        id
        name
        userTime
      }
      vehicleBookings {
        id
        vehicleId
        userTime
      }
      bookableVehicles {
        id
        name
      }
      comments {
        id
        content
        eventTime
      }
    }
  }
`;

export const COMPANY_QUERY = gql`
  query($id: Int!) {
    company(id: $id) {
      users {
        id
        firstName
        lastName
        workDays {
          startTime
          endTime
          expenditures {
            type
          }
          activityTimers
          wasModified
        }
      }
      vehicles {
        id
        registrationNumber
        alias
      }
    }
  }
`;

export const ACTIVITY_LOG_MUTATION = gql`
  mutation($data: [SingleActivityInput]!) {
    logActivities(data: $data) {
      user {
        activities {
          id
          type
          userTime
          driverId
        }
        teamEnrollments {
          id
          userId
          type
          userTime
        }
        missions {
          id
          name
          userTime
        }
        vehicleBookings {
          id
          vehicleId
          userTime
        }
        bookableVehicles {
          id
          name
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
        userTime
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
        userTime
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
        userTime
      }
    }
  }
`;

export const MISSION_LOG_MUTATION = gql`
  mutation($data: [MissionInput]!) {
    logMissions(data: $data) {
      missions {
        id
        name
        userTime
      }
    }
  }
`;

export const VEHICLE_BOOKING_LOG_MUTATION = gql`
  mutation($data: [VehicleBookingInput]!) {
    logVehicleBookings(data: $data) {
      vehicleBookings {
        id
        vehicleId
        userTime
      }
      bookableVehicles {
        id
        name
      }
    }
  }
`;

export const VEHICLE_CREATE_MUTATION = gql`
  mutation($registrationNumber: String!, $alias: String, $companyId: Int!) {
    createVehicle(
      registrationNumber: $registrationNumber
      alias: $alias
      companyId: $companyId
    ) {
      vehicle {
        id
        registrationNumber
        alias
      }
    }
  }
`;

export const VEHICLE_EDIT_MUTATION = gql`
  mutation($id: Int!, $alias: String!) {
    editVehicle(id: $id, alias: $alias) {
      vehicle {
        id
        registrationNumber
        alias
      }
    }
  }
`;

export const VEHICLE_TERMINATE_MUTATION = gql`
  mutation($id: Int!) {
    terminateVehicle(id: $id) {
      success
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
          this.refreshTokenQueue.clear();
          this.nonConcurrentQueryQueue.clear();
          this.logout();
        }
      }
    });
    this.refreshTokenQueue = new NonConcurrentExecutionQueue("refreshToken");
    this.nonConcurrentQueryQueue = new NonConcurrentExecutionQueue("events");
  }

  async graphQlQuery(query, variables) {
    return await this._queryWithRefreshToken(() =>
      this.apolloClient.query({ query, variables, fetchPolicy: "no-cache" })
    );
  }

  async graphQlMutate(query, variables, nonConcurrent = false) {
    const mutation = () =>
      this._queryWithRefreshToken(() =>
        this.apolloClient.mutate({
          mutation: query,
          variables: variables,
          fetchPolicy: "no-cache"
        })
      );
    if (nonConcurrent)
      return await this.nonConcurrentQueryQueue.execute(mutation);
    return await mutation();
  }

  async httpQuery(method, endpoint, options = {}) {
    return await this._queryWithRefreshToken(() => {
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

  async _queryWithRefreshToken(query) {
    const isTokenValidOrRenewedOrNone = await this.refreshTokenQueue.execute(
      () => this._refreshTokenIfNeeded()
    );
    if (isTokenValidOrRenewedOrNone) return await query();
    // No need to catch the refresh-token error since logout is imminent
  }

  submitEvents(query, storeEntry, handleSubmitResponse) {
    return this.nonConcurrentQueryQueue.execute(async () => {
      const eventsPendingSubmission = await this.storeSyncedWithLocalStorage.markAndGetEventsForSubmission(
        storeEntry
      );
      if (eventsPendingSubmission.length === 0) return;
      try {
        const submit = await this._queryWithRefreshToken(() =>
          this.apolloClient.mutate({
            mutation: query,
            variables: {
              data: eventsPendingSubmission.map(e => {
                const { isBeingSubmitted, ...event } = e;
                return event;
              })
            }
          })
        );
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
  }
}

const api = new Api();

export function ApiContextProvider({ children }) {
  api.storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export const useApi = () => React.useContext(ApiContext);
