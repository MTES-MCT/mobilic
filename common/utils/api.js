import React from "react";
import forEach from "lodash/forEach";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { BatchHttpLink } from "apollo-link-batch-http";
import { ApolloLink, Observable } from "apollo-link";
import gql from "graphql-tag";
import jwtDecode from "jwt-decode";
import * as Sentry from "@sentry/browser";
import { useStoreSyncedWithLocalStorage } from "./store";
import { isAuthenticationError, isRetryable } from "./errors";
import { NonConcurrentExecutionQueue } from "./concurrency";
import { buildFCLogoutUrl } from "./franceConnect";

export const API_HOST = process.env.REACT_APP_API_HOST || "/api";

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

const CHECK_MUTATION = gql`
  mutation checkAuthentication {
    auth {
      check {
        message
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
          userId
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

export const COMPANY_QUERY = gql`
  query company($id: Int!, $activityAfter: Date) {
    company(id: $id) {
      users {
        id
        firstName
        lastName
      }
      workDays(fromDate: $activityAfter) {
        user {
          id
          firstName
          lastName
        }
        startTime
        endTime
        expenditures
        activityTimers
        wasModified
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

export const GET_EMPLOYMENT_QUERY = gql`
  query getInvitation($inviteToken: String!) {
    employment(inviteToken: $inviteToken) {
      id
      startDate
      isPrimary
      hasAdminRights
      inviteToken
      company {
        id
        name
      }
      submitter {
        id
        firstName
        lastName
      }
    }
  }
`;

export const REDEEM_INVITE_QUERY = gql`
  mutation redeemInvite($inviteToken: String!) {
    signUp {
      redeemInvite(inviteToken: $inviteToken) {
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
        message
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
    $type: InputableActivityTypeEnum!
    $startTime: TimeStamp!
    $endTime: TimeStamp
    $missionId: Int!
    $userId: Int
    $context: GenericScalar
  ) {
    activities {
      logActivity(
        type: $type
        startTime: $startTime
        endTime: $endTime
        missionId: $missionId
        userId: $userId
        context: $context
      ) {
        id
        type
        userId
        missionId
        startTime
      }
    }
  }
`;

export const CANCEL_ACTIVITY_MUTATION = gql`
  mutation cancelActivity($activityId: Int!, $context: GenericScalar) {
    activities {
      cancelActivity(activityId: $activityId, context: $context) {
        id
        type
        missionId
        userId
        startTime
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
  ) {
    activities {
      editActivity(
        activityId: $activityId
        startTime: $startTime
        endTime: $endTime
        context: $context
      ) {
        id
        type
        missionId
        userId
        startTime
      }
    }
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
  mutation endMission(
    $endTime: TimeStamp!
    $missionId: Int!
    $userId: Int
    $context: GenericScalar
  ) {
    activities {
      endMission(
        endTime: $endTime
        missionId: $missionId
        userId: $userId
        context: $context
      ) {
        id
        name
        context
        activities {
          id
          type
          missionId
          userId
          startTime
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
        id
        name
        validations {
          submitterId
        }
        context
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
        id
        type
        missionId
        userId
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
            this.refreshTokenQueue.clear();
            this.nonConcurrentQueryQueue.clear();
            this.logout();
          }
        }),
        new ApolloLink(
          (operation, forward) =>
            new Observable(observer => {
              let handle;
              Promise.resolve(operation)
                .then(oper => {
                  const token =
                    oper.operationName === "refreshToken"
                      ? this.store.refreshToken()
                      : this.store.accessToken();
                  oper.setContext({
                    headers: {
                      authorization: token ? `Bearer ${token}` : ""
                    }
                  });
                })
                .then(() => {
                  handle = forward(operation).subscribe({
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer)
                  });
                })
                .catch(observer.error.bind(observer));

              return () => {
                if (handle) handle.unsubscribe();
              };
            })
        ),
        ApolloLink.split(
          operation => {
            return !!operation.getContext().nonPublicApi;
          },
          new HttpLink({ uri: nonPublicUri }),
          ApolloLink.split(
            operation => !!operation.getContext().batchable,
            new BatchHttpLink({ uri }),
            new HttpLink({ uri })
          )
        )
      ]),
      cache: new InMemoryCache()
    });
    this.refreshTokenQueue = new NonConcurrentExecutionQueue("refreshToken");
    this.nonConcurrentQueryQueue = new NonConcurrentExecutionQueue("events");
    this.isCurrentlySubmittingRequests = () =>
      this.nonConcurrentQueryQueue.lock;
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

  async httpQuery(method, endpoint, options = {}) {
    return await this._queryWithRefreshToken(() => {
      const url = `${this.apiHost}${endpoint}`;
      if (!options.headers) options.headers = {};
      options.headers.Authorization = `Bearer ${this.store.accessToken()}`;
      options.method = method;
      return fetch(url, options);
    });
  }

  async _refreshTokenIfNeeded() {
    const accessToken = this.store.accessToken();
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        const timeToExpire =
          decodedToken.exp && decodedToken.exp * 1000 - new Date().getTime();
        if (timeToExpire && timeToExpire < 10000) {
          const refreshResponse = await this.apolloClient.mutate({
            mutation: REFRESH_MUTATION
          });
          await this.store.storeTokens({
            ...refreshResponse.data.auth.refresh,
            keepFcToken: true
          });
        }
      } catch (err) {
        console.log(`Error refreshing tokens : ${err}`);
        throw err;
      }
    }
  }

  async _queryWithRefreshToken(query) {
    await this.refreshTokenQueue.execute(() => this._refreshTokenIfNeeded());
    return await query();
    // No need to catch the refresh-token error since logout is imminent
  }

  async executeRequest(request) {
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
      await request.handleSubmitResponse(submit);

      // 4. Remove the temporary updates and the pending request from the pool
      await this.store.clearPendingRequest(request);
    } catch (err) {
      if (!isRetryable(err)) {
        if (request.onApiError) await request.onApiError(err);
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
    return this.nonConcurrentQueryQueue.execute(async () => {
      // 1. Retrieve all pending requests
      while (this.store.pendingRequests().length > 0) {
        let errors = [];
        const pendingRequests = this.store.pendingRequests();
        const batch = [];
        forEach(pendingRequests, request => {
          if (request.batchable) batch.push(request);
          else {
            if (batch.length === 0) batch.push(request);
            return false;
          }
        });
        await Promise.all(
          batch.map(async request => {
            try {
              await this.executeRequest(request);
            } catch (err) {
              // It is important to wait for ALL the batched request handlers to execute
              // because they are all processed by the API regardless of whether the others fail
              // So we avoid throwing an error here, otherwise the other successful promises could be cancelled
              errors.push(err);
            }
          })
        );
        if (errors.length > 0) {
          if (failOnError) throw errors[0];
          return;
        }
      }
    });
  }

  async logout(logoutFromFC = true) {
    const fcToken = this.store.fcToken();
    if (fcToken && logoutFromFC) {
      window.location.href = buildFCLogoutUrl(fcToken);
    } else {
      await this.store.removeTokensAndUserInfo();
    }
  }

  async checkAuthentication() {
    const userId = this.store.userId();
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
