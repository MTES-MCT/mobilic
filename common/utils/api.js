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
      missions {
        id
        name
        eventTime
        activities {
          id
          type
          missionId
          userTime
          driver {
            id
            firstName
            lastName
          }
        }
        vehicleBookings {
          id
          vehicleName
          userTime
          missionId
        }
        comments {
          id
          content
          missionId
          eventTime
        }
      }
      enrollableCoworkers {
        id
        firstName
        lastName
        joinedCurrentMissionAt
        leftCurrentMissionAt
      }
      bookableVehicles {
        id
        name
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
          expenditures
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

export const LOG_ACTIVITY_MUTATION = gql`
  mutation(
    $type: InputableActivityTypeEnum!
    $eventTime: DateTimeWithTimeStampSerialization!
    $userTime: DateTimeWithTimeStampSerialization
    $missionId: Int
    $comment: String
    $driver: TeamMateInput
  ) {
    logActivity(
      type: $type
      eventTime: $eventTime
      userTime: $userTime
      driver: $driver
      missionId: $missionId
      comment: $comment
    ) {
      missionActivities {
        id
        type
        missionId
        userTime
        driver {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const EDIT_ACTIVITY_MUTATION = gql`
  mutation(
    $eventTime: DateTimeWithTimeStampSerialization!
    $userTime: DateTimeWithTimeStampSerialization
    $dismiss: Boolean!
    $activityId: Int!
    $comment: String
  ) {
    editActivity(
      eventTime: $eventTime
      userTime: $userTime
      dismiss: $dismiss
      activityId: $activityId
      comment: $comment
    ) {
      missionActivities {
        id
        type
        missionId
        userTime
        driver {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const LOG_COMMENT_MUTATION = gql`
  mutation(
    $eventTime: DateTimeWithTimeStampSerialization!
    $content: String!
    $missionId: Int
  ) {
    logComment(
      eventTime: $eventTime
      content: $content
      missionId: $missionId
    ) {
      comment {
        id
        content
        missionId
        eventTime
      }
    }
  }
`;

export const ENROLL_OR_RELEASE_TEAM_MATE_MUTATION = gql`
  mutation(
    $eventTime: DateTimeWithTimeStampSerialization!
    $teamMate: TeamMateInput!
    $isEnrollment: Boolean!
  ) {
    enrollOrReleaseTeamMate(
      eventTime: $eventTime
      teamMate: $teamMate
      isEnrollment: $isEnrollment
    ) {
      coworker {
        id
        firstName
        lastName
        joinedCurrentMissionAt
        leftCurrentMissionAt
      }
    }
  }
`;

export const BEGIN_MISSION_MUTATION = gql`
  mutation(
    $eventTime: DateTimeWithTimeStampSerialization!
    $name: String!
    $firstActivityType: InputableActivityTypeEnum!
    $vehicleRegistrationNumber: String
    $vehicleId: Int
    $team: [TeamMateInput]
    $driver: TeamMateInput
  ) {
    beginMission(
      eventTime: $eventTime
      name: $name
      firstActivityType: $firstActivityType
      vehicleRegistrationNumber: $vehicleRegistrationNumber
      vehicleId: $vehicleId
      team: $team
      driver: $driver
    ) {
      mission {
        id
        name
        eventTime
        activities {
          id
          type
          missionId
          userTime
          driver {
            id
            firstName
            lastName
          }
        }
        vehicleBookings {
          id
          vehicleName
          vehicle {
            id
            name
          }
          userTime
          missionId
        }
      }
    }
  }
`;

export const END_MISSION_MUTATION = gql`
  mutation(
    $eventTime: DateTimeWithTimeStampSerialization!
    $missionId: Int
    $expenditures: GenericScalar
  ) {
    endMission(
      eventTime: $eventTime
      missionId: $missionId
      expenditures: $expenditures
    ) {
      mission {
        id
        name
        eventTime
        activities {
          id
          type
          missionId
          userTime
          driver {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const BOOK_VEHICLE_MUTATION = gql`
  mutation(
    $eventTime: DateTimeWithTimeStampSerialization!
    $vehicleId: Int
    $missionId: Int
    $registrationNumber: String
    $userTime: DateTimeWithTimeStampSerialization
  ) {
    bookVehicle(
      eventTime: $eventTime
      vehicleId: $vehicleId
      missionId: $missionId
      registrationNumber: $registrationNumber
      userTime: $userTime
    ) {
      vehicleBooking {
        id
        vehicleName
        vehicle {
          id
          name
        }
        userTime
        missionId
      }
    }
  }
`;

export const CREATE_VEHICLE_MUTATION = gql`
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

export const EDIT_VEHICLE_MUTATION = gql`
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

export const TERMINATE_VEHICLE_MUTATION = gql`
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

  async executeRequest(request) {
    try {
      // 1. Call the API
      const submit = await this._queryWithRefreshToken(() =>
        this.apolloClient.mutate({
          mutation: request.query,
          variables: request.variables,
          context: {batchable: request.batchable},
        })
      );
      // 3. Commit the persistent changes to the store
      await request.handleSubmitResponse(submit);

      // 4. Remove the temporary updates and the pending request from the pool
      await this.store.clearPendingRequest(request);
    } catch (err) {
      if (isGraphQLParsingError(err)) {
        await this.store.clearPendingRequest(request);
      }
    }
  }

  async executePendingRequests() {
    return this.nonConcurrentQueryQueue.execute(async () => {
      // 1. Retrieve all pending requests
      const pendingRequests = await this.store.pendingRequests();
      if (pendingRequests.length === 0) return;
      await Promise.all(pendingRequests.map(async request => this.executeRequest(request)));
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
