import { gql } from "graphql-tag";
import { buildBackendPayloadForAddress } from "./addresses";
import {
  COMPANY_SETTINGS_FRAGMENT,
  CONTROL_BULLETIN_FRAGMENT,
  FRAGMENT_LOCATION_FULL,
  FULL_MISSION_FRAGMENT,
  FULL_TEAM_FRAGMENT,
  REGULATION_COMPUTATIONS_FRAGMENT,
  WORK_DAYS_DATA_FRAGMENT
} from "./apiFragments";
import { nowMilliseconds } from "./time";

export const ALL_MISSION_RESOURCES_WITH_HISTORY_QUERY = gql`
  ${FRAGMENT_LOCATION_FULL}
  query activitiesAndExpendituresHistory($missionId: Int!) {
    mission(id: $missionId) {
      receptionTime
      submitter {
        id
        firstName
        lastName
      }
      activities(includeDismissedActivities: true) {
        id
        type
        missionId
        startTime
        endTime
        userId
        receptionTime
        lastUpdateTime
        dismissedAt
        lastSubmitterId
        submitter {
          id
          firstName
          lastName
        }
        dismissAuthor {
          id
          firstName
          lastName
        }
        versions {
          id
          startTime
          endTime
          receptionTime
          submitter {
            id
            firstName
            lastName
          }
        }
      }
      expenditures(includeDismissedExpenditures: true) {
        id
        type
        missionId
        userId
        receptionTime
        spendingDate
        dismissedAt
        submitter {
          id
          firstName
          lastName
        }
        dismissAuthor {
          id
          firstName
          lastName
        }
      }
      validations {
        id
        isAdmin
        userId
        receptionTime
        missionId
        submitter {
          id
          firstName
          lastName
        }
      }
      startLocation {
        ...FullLocation
        receptionTime
        submitter {
          id
          firstName
          lastName
        }
        missionId
      }
      endLocation {
        ...FullLocation
        receptionTime
        submitter {
          id
          firstName
          lastName
        }
        missionId
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
    $password: Password!
    $firstName: String!
    $lastName: String!
    $inviteToken: String
    $subscribeToNewsletter: Boolean
    $isEmployee: Boolean
    $timezoneName: String
    $wayHeardOfMobilic: String
  ) {
    signUp {
      user(
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
        inviteToken: $inviteToken
        subscribeToNewsletter: $subscribeToNewsletter
        isEmployee: $isEmployee
        timezoneName: $timezoneName
        wayHeardOfMobilic: $wayHeardOfMobilic
      ) {
        accessToken
        refreshToken
      }
    }
  }
`;
export const CONFIRM_FC_EMAIL_MUTATION = gql`
  mutation confirmFcEmail(
    $email: String!
    $password: Password
    $timezoneName: String
    $wayHeardOfMobilic: String
  ) {
    signUp {
      confirmFcEmail(
        email: $email
        password: $password
        timezoneName: $timezoneName
        wayHeardOfMobilic: $wayHeardOfMobilic
      ) {
        email
        hasConfirmedEmail
      }
    }
  }
`;
export const COMPANY_SIGNUP_MUTATION = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  mutation companySignUp($siren: String!, $usualName: String!) {
    signUp {
      company(siren: $siren, usualName: $usualName) {
        employment {
          id
          startDate
          isAcknowledged
          hasAdminRights
          company {
            id
            name
            siren
            sirets
            ...CompanySettings
          }
        }
      }
    }
  }
`;
export const COMPANIES_SIGNUP_MUTATION = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  mutation companiesSignUp($siren: String!, $companies: [CompanySiret]!) {
    signUp {
      companies(siren: $siren, companies: $companies) {
        employment {
          id
          startDate
          isAcknowledged
          hasAdminRights
          company {
            id
            name
            siren
            sirets
            ...CompanySettings
          }
        }
      }
    }
  }
`;
export const SIREN_QUERY = gql`
  query sirenInfo($siren: String!) {
    sirenInfo(siren: $siren) {
      registrationStatus
      legalUnit
      facilities
    }
  }
`;

export const USER_READ_TOKEN_QUERY = gql`
  query readUserToken($token: String!) {
    userReadToken(token: $token) {
      creationTime
      validUntil
      creationDay
      historyStartDay
    }
  }
`;

export const CONTROLLER_READ_MISSION_DETAILS = gql`
  ${FRAGMENT_LOCATION_FULL}
  query readMissionControlData($controlId: Int!, $missionId: Int!) {
    controlData(controlId: $controlId) {
      missions(missionId: $missionId) {
        receptionTime
        submitter {
          id
          firstName
          lastName
        }
        activities(includeDismissedActivities: true) {
          id
          type
          missionId
          startTime
          endTime
          userId
          receptionTime
          lastUpdateTime
          dismissedAt
          lastSubmitterId
          submitter {
            id
            firstName
            lastName
          }
          dismissAuthor {
            id
            firstName
            lastName
          }
          versions {
            id
            startTime
            endTime
            receptionTime
            submitter {
              id
              firstName
              lastName
            }
          }
        }
        expenditures(includeDismissedExpenditures: true) {
          id
          type
          missionId
          userId
          receptionTime
          spendingDate
          dismissedAt
          submitter {
            id
            firstName
            lastName
          }
          dismissAuthor {
            id
            firstName
            lastName
          }
        }
        validations {
          id
          isAdmin
          userId
          receptionTime
          missionId
          submitter {
            id
            firstName
            lastName
          }
        }
        startLocation {
          ...FullLocation
          receptionTime
          submitter {
            id
            firstName
            lastName
          }
          missionId
        }
        endLocation {
          ...FullLocation
          receptionTime
          submitter {
            id
            firstName
            lastName
          }
          missionId
        }
      }
    }
  }
`;

export const CONTROLLER_READ_CONTROL_DATA = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
  ${REGULATION_COMPUTATIONS_FRAGMENT}
  ${CONTROL_BULLETIN_FRAGMENT}
  query readControlData($controlId: Int!) {
    controlData(controlId: $controlId) {
      id
      creationTime
      qrCodeGenerationTime
      companyName
      vehicleRegistrationNumber
      historyStartDate
      nbControlledDays
      controlBulletin {
        ...ControlBulletin
      }
      siren
      companyAddress
      missionAddressBegin
      missions {
        id
        name
        company {
          id
          name
          siren
          legalName
          ...CompanySettings
        }
        validations {
          submitterId
          receptionTime
          isAdmin
          userId
        }
        vehicle {
          id
          name
          registrationNumber
        }
        context
        expenditures {
          id
          type
          missionId
          userId
          spendingDate
          receptionTime
        }
        activities {
          id
          type
          missionId
          startTime
          endTime
          userId
          lastSubmitterId
          user {
            id
            firstName
            lastName
          }
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
        startLocation {
          ...FullLocation
        }
        endLocation {
          ...FullLocation
        }
      }
      employments {
        id
        startDate
        isAcknowledged
        hasAdminRights
        endDate
        company {
          id
          name
          siren
          sirets
          legalName
          ...CompanySettings
          vehicles {
            id
            name
            registrationNumber
          }
        }
      }
      user {
        id
        firstName
        lastName
        birthDate
        email
      }
      regulationComputationsByDay {
        ...RegulationComputations
      }
    }
  }
`;

export const USER_READ_REGULATION_COMPUTATIONS_QUERY = gql`
  ${REGULATION_COMPUTATIONS_FRAGMENT}
  query getUserRegulationComputations(
    $userId: Int!
    $fromDate: Date
    $toDate: Date
  ) {
    user(id: $userId) {
      regulationComputationsByDay(fromDate: $fromDate, toDate: $toDate) {
        ...RegulationComputations
      }
    }
  }
`;

export const USER_READ_QUERY = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
  query readUser {
    me {
      id
      firstName
      lastName
      birthDate
      email
      missions {
        edges {
          node {
            id
            name
            company {
              id
              name
              siren
              ...CompanySettings
            }
            validations {
              submitterId
              receptionTime
              isAdmin
              userId
            }
            vehicle {
              id
              name
              registrationNumber
            }
            context
            expenditures {
              id
              type
              missionId
              userId
              spendingDate
              receptionTime
            }
            activities {
              id
              type
              missionId
              startTime
              endTime
              userId
              lastSubmitterId
              user {
                id
                firstName
                lastName
              }
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
            startLocation {
              ...FullLocation
            }
            endLocation {
              ...FullLocation
            }
          }
        }
      }
      employments {
        id
        startDate
        isAcknowledged
        hasAdminRights
        endDate
        company {
          id
          name
          siren
          sirets
          legalName
          ...CompanySettings
          vehicles {
            id
            name
            registrationNumber
          }
        }
      }
    }
  }
`;

export const USER_MISSIONS_HISTORY_QUERY = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
  ${FULL_MISSION_FRAGMENT}
  query readUserMissionsHistory($fromTime: TimeStamp!, $untilTime: TimeStamp!) {
    me {
      missions(fromTime: $fromTime, untilTime: $untilTime) {
        edges {
          node {
            ...FullMissionData
          }
        }
      }
    }
  }
`;

export const USER_WORK_DAY_QUERY = gql`
  query workDayDetail(
    $activityBefore: TimeStamp
    $activityAfter: TimeStamp
    $missionBefore: TimeStamp
    $missionAfter: TimeStamp
    $userId: Int!
  ) {
    user(id: $userId) {
      activities(fromTime: $activityAfter, untilTime: $activityBefore) {
        edges {
          node {
            id
            type
            startTime
            endTime
          }
        }
      }
      missions(fromTime: $missionAfter, untilTime: $missionBefore) {
        edges {
          node {
            id
            name
            startLocation {
              name
            }
            endLocation {
              name
            }
          }
        }
      }
    }
  }
`;

export const ADMIN_COMPANIES_LIST_QUERY = gql`
  query adminCompaniesList($id: Int!) {
    user(id: $id) {
      adminedCompanies {
        id
        name
        siren
      }
    }
  }
`;

export const THIRD_PARTY_CLIENTS_COMPANY_QUERY = gql`
  query thirdPartyClientsCompany($userId: Int!, $companyIds: [Int]) {
    user(id: $userId) {
      adminedCompanies(companyIds: $companyIds) {
        authorizedClients {
          id
          name
        }
      }
    }
  }
`;

export const ALL_TEAMS_COMPANY_QUERY = gql`
  ${FULL_TEAM_FRAGMENT}
  query allTeamsCompany($companyId: Int!) {
    company(id: $companyId) {
      teams {
        ...FullTeamData
      }
    }
  }
`;

export const DELETE_TEAM_MUTATION = gql`
  ${FULL_TEAM_FRAGMENT}
  mutation deleteTeam($teamId: Int!) {
    teams {
      deleteTeam(teamId: $teamId) {
        teams {
          ...FullTeamData
        }
        employments {
          id
          startDate
          endDate
          isAcknowledged
          email
          hasAdminRights
          latestInviteEmailTime
          teamId
          companyId
          company {
            id
            name
            siren
          }
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const CREATE_TEAM_MUTATION = gql`
  ${FULL_TEAM_FRAGMENT}
  mutation createTeam(
    $companyId: Int!
    $name: String!
    $userIds: [Int]
    $adminIds: [Int]
    $knownAddressIds: [Int]
    $vehicleIds: [Int]
  ) {
    teams {
      createTeam(
        companyId: $companyId
        name: $name
        userIds: $userIds
        adminIds: $adminIds
        knownAddressIds: $knownAddressIds
        vehicleIds: $vehicleIds
      ) {
        teams {
          ...FullTeamData
        }
        employments {
          id
          startDate
          endDate
          isAcknowledged
          email
          hasAdminRights
          latestInviteEmailTime
          teamId
          companyId
          company {
            id
            name
            siren
          }
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const UPDATE_TEAM_MUTATION = gql`
  ${FULL_TEAM_FRAGMENT}
  mutation updateTeam(
    $teamId: Int!
    $name: String!
    $userIds: [Int]
    $adminIds: [Int]
    $knownAddressIds: [Int]
    $vehicleIds: [Int]
  ) {
    teams {
      updateTeam(
        teamId: $teamId
        name: $name
        userIds: $userIds
        adminIds: $adminIds
        knownAddressIds: $knownAddressIds
        vehicleIds: $vehicleIds
      ) {
        teams {
          ...FullTeamData
        }
        employments {
          id
          startDate
          endDate
          isAcknowledged
          email
          hasAdminRights
          latestInviteEmailTime
          teamId
          companyId
          company {
            id
            name
            siren
          }
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const ADMIN_COMPANIES_QUERY = gql`
  ${WORK_DAYS_DATA_FRAGMENT}
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
  query adminCompanies(
    $id: Int!
    $activityAfter: Date
    $workDaysLimit: Int
    $endedMissionsAfter: TimeStamp
    $companyIds: [Int]
  ) {
    user(id: $id) {
      adminedCompanies(companyIds: $companyIds) {
        id
        name
        ...CompanySettings
        users(fromDate: $activityAfter) {
          id
          firstName
          lastName
        }
        teams {
          id
          name
          adminUsers {
            id
            firstName
            lastName
          }
          users {
            id
            firstName
            lastName
          }
        }
        knownAddresses {
          id
          alias
          name
          postalCode
          city
        }
        workDays(fromDate: $activityAfter, first: $workDaysLimit) {
          ...WorkDayData
        }
        missions(fromTime: $endedMissionsAfter, onlyEndedMissions: false) {
          edges {
            node {
              id
              name
              submitterId
              validations {
                submitterId
                receptionTime
                isAdmin
                userId
              }
              vehicle {
                id
                name
                registrationNumber
              }
              expenditures {
                id
                type
                userId
                receptionTime
                spendingDate
              }
              startLocation {
                ...FullLocation
              }
              endLocation {
                ...FullLocation
              }
              activities {
                id
                type
                startTime
                endTime
                lastUpdateTime
                lastSubmitterId
                user {
                  id
                  firstName
                  lastName
                }
                submitterId
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
          email
          hasAdminRights
          latestInviteEmailTime
          teamId
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const ADMIN_WORK_DAYS_QUERY = gql`
  ${WORK_DAYS_DATA_FRAGMENT}
  query adminCompanies(
    $id: Int!
    $activityAfter: Date
    $activityBefore: Date
    $companyIds: [Int]
  ) {
    user(id: $id) {
      adminedCompanies(companyIds: $companyIds) {
        id
        users(fromDate: $activityAfter) {
          id
          firstName
          lastName
        }
        workDays(fromDate: $activityAfter, untilDate: $activityBefore) {
          ...WorkDayData
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
      hasAdminRights
      company {
        id
        name
        siren
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
        isAcknowledged
        hasAdminRights
        company {
          id
          name
          siren
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
export const CHANGE_NAME_MUTATION = gql`
  mutation changeName(
    $userId: Int!
    $newFirstName: String!
    $newLastName: String!
  ) {
    account {
      changeName(
        userId: $userId
        newFirstName: $newFirstName
        newLastName: $newLastName
      ) {
        id
        firstName
        lastName
      }
    }
  }
`;
export const CHANGE_TIMEZONE_MUTATION = gql`
  mutation changeTimezone($timezoneName: String!) {
    account {
      changeTimezone(timezoneName: $timezoneName) {
        timezoneName
      }
    }
  }
`;
export const RESEND_ACTIVATION_EMAIL = gql`
  mutation resendActivationEmail($email: String!) {
    account {
      resendActivationEmail(email: $email) {
        success
      }
    }
  }
`;
export const RESET_PASSWORD_MUTATION = gql`
  mutation resetPassword($token: String!, $password: Password!) {
    account {
      resetPassword(token: $token, password: $password) {
        id
      }
    }
  }
`;
export const RESET_PASSWORD_CONNECTED_MUTATION = gql`
  mutation resetPasswordConnected($userId: Int!, $password: Password!) {
    account {
      resetPasswordConnected(userId: $userId, password: $password) {
        success
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
export const AGENT_CONNECT_LOGIN_MUTATION = gql`
  mutation agentConnectLogin(
    $authorizationCode: String!
    $originalRedirectUri: String!
    $state: String!
  ) {
    auth {
      agentConnectLogin(
        authorizationCode: $authorizationCode
        originalRedirectUri: $originalRedirectUri
        state: $state
      ) {
        accessToken
        refreshToken
        acToken
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
        hasAdminRights
        company {
          id
          name
          siren
          sirets
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
          siren
          sirets
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
        email
        hasAdminRights
        company {
          id
          name
          siren
        }
        user {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export const SEND_EMPLOYMENT_INVITE_REMINDER = gql`
  mutation sendInviteReminder($employmentId: Int!) {
    employments {
      sendInvitationReminder(employmentId: $employmentId) {
        success
      }
    }
  }
`;

export const CHANGE_EMPLOYEE_ROLE = gql`
  ${FULL_TEAM_FRAGMENT}
  mutation changeEmployeeRole($employmentId: Int!, $hasAdminRights: Boolean!) {
    employments {
      changeEmployeeRole(
        employmentId: $employmentId
        hasAdminRights: $hasAdminRights
      ) {
        teams {
          ...FullTeamData
        }
        employments {
          id
          startDate
          endDate
          isAcknowledged
          email
          hasAdminRights
          latestInviteEmailTime
          teamId
          companyId
          company {
            id
            name
            siren
          }
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const CHANGE_EMPLOYEE_TEAM = gql`
  ${FULL_TEAM_FRAGMENT}
  mutation changeEmployeeTeam($companyId: Int!, $userId: Int!, $teamId: Int) {
    employments {
      changeEmployeeTeam(
        companyId: $companyId
        userId: $userId
        teamId: $teamId
      ) {
        teams {
          ...FullTeamData
        }
        employments {
          id
          startDate
          endDate
          isAcknowledged
          email
          hasAdminRights
          latestInviteEmailTime
          teamId
          companyId
          company {
            id
            name
            siren
          }
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
    }
  }
`;

export const BATCH_CREATE_WORKER_EMPLOYMENTS_MUTATION = gql`
  mutation batchCreateWorkerEmployments($companyId: Int!, $mails: [String]!) {
    employments {
      batchCreateWorkerEmployments(companyId: $companyId, mails: $mails) {
        id
        startDate
        endDate
        isAcknowledged
        email
        hasAdminRights
        latestInviteEmailTime
        user {
          id
          email
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
    $teamId: Int
  ) {
    employments {
      createEmployment(
        userId: $userId
        companyId: $companyId
        hasAdminRights: $hasAdminRights
        mail: $mail
        teamId: $teamId
      ) {
        id
        startDate
        endDate
        isAcknowledged
        email
        hasAdminRights
        teamId
        company {
          id
          name
          siren
        }
        user {
          id
          email
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
    $creationTime: TimeStamp
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
        creationTime: $creationTime
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
        lastSubmitterId
      }
    }
  }
`;
export const CANCEL_ACTIVITY_MUTATION = gql`
  mutation cancelActivity(
    $activityId: Int!
    $context: GenericScalar
    $creationTime: TimeStamp
  ) {
    activities {
      cancelActivity(
        activityId: $activityId
        context: $context
        creationTime: $creationTime
      ) {
        success
      }
    }
  }
`;
export const CANCEL_MISSION_MUTATION = gql`
  mutation cancelMission($missionId: Int!, $userId: Int!) {
    activities {
      cancelMission(missionId: $missionId, userId: $userId) {
        activities {
          id
          type
          missionId
          startTime
          endTime
          userId
          submitterId
          lastSubmitterId
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
export const EDIT_ACTIVITY_MUTATION = gql`
  mutation editActivity(
    $activityId: Int!
    $context: GenericScalar
    $startTime: TimeStamp
    $endTime: TimeStamp
    $removeEndTime: Boolean
    $creationTime: TimeStamp
  ) {
    activities {
      editActivity(
        activityId: $activityId
        startTime: $startTime
        endTime: $endTime
        context: $context
        removeEndTime: $removeEndTime
        creationTime: $creationTime
      ) {
        id
        type
        missionId
        userId
        startTime
        endTime
        lastSubmitterId
      }
    }
  }
`;
export const BULK_ACTIVITY_QUERY = gql`
  query bulkActivity($items: [BulkActivityItem]) {
    output(items: $items) {
      id
      type
      missionId
      userId
      startTime
      endTime
      lastSubmitterId
    }
  }
`;

export const CURRENT_MISSION_INFO = gql`
  query currentMissionInfo($id: Int!) {
    mission(id: $id) {
      isEndedForSelf
      submitter {
        id
        firstName
        lastName
      }
    }
  }
`;

export const CREATE_MISSION_MUTATION = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  mutation createMission(
    $name: String
    $companyId: Int!
    $context: GenericScalar
    $vehicleId: Int
    $vehicleRegistrationNumber: String
    $creationTime: TimeStamp
  ) {
    activities {
      createMission(
        name: $name
        companyId: $companyId
        context: $context
        vehicleId: $vehicleId
        vehicleRegistrationNumber: $vehicleRegistrationNumber
        creationTime: $creationTime
      ) {
        id
        name
        context
        vehicle {
          id
          name
          registrationNumber
        }
        company {
          id
          name
          siren
          ...CompanySettings
        }
      }
    }
  }
`;
export const END_MISSION_MUTATION = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
  mutation endMission(
    $endTime: TimeStamp!
    $missionId: Int!
    $userId: Int
    $creationTime: TimeStamp
  ) {
    activities {
      endMission(
        endTime: $endTime
        missionId: $missionId
        userId: $userId
        creationTime: $creationTime
      ) {
        id
        name
        context
        vehicle {
          id
          name
          registrationNumber
        }
        submitter {
          id
          firstName
          lastName
        }
        startLocation {
          ...FullLocation
        }
        endLocation {
          ...FullLocation
        }
        company {
          id
          name
          siren
          ...CompanySettings
        }
        activities {
          id
          type
          missionId
          userId
          startTime
          endTime
          lastSubmitterId
        }
      }
    }
  }
`;
export const LOG_LOCATION_MUTATION = gql`
  ${FRAGMENT_LOCATION_FULL}
  mutation logLocation(
    $companyKnownAddressId: Int
    $type: LocationEntryTypeEnum!
    $missionId: Int!
    $geoApiData: GenericScalar
    $manualAddress: String
    $kilometerReading: Int
    $overrideExisting: Boolean
    $creationTime: TimeStamp
  ) {
    activities {
      logLocation(
        companyKnownAddressId: $companyKnownAddressId
        missionId: $missionId
        type: $type
        geoApiData: $geoApiData
        manualAddress: $manualAddress
        kilometerReading: $kilometerReading
        overrideExisting: $overrideExisting
        creationTime: $creationTime
      ) {
        ...FullLocation
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
  mutation($id: Int!, $alias: String) {
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

export const CREATE_KNOWN_ADDRESS_MUTATION = gql`
  mutation createKnownAddress(
    $geoApiData: GenericScalar
    $manualAddress: String
    $alias: String
    $companyId: Int!
  ) {
    locations {
      createKnownAddress(
        geoApiData: $geoApiData
        manualAddress: $manualAddress
        alias: $alias
        companyId: $companyId
      ) {
        id
        name
        alias
        postalCode
        city
      }
    }
  }
`;
export const EDIT_KNOWN_ADDRESS_MUTATION = gql`
  mutation editKnownAddress($companyKnownAddressId: Int!, $alias: String) {
    locations {
      editKnownAddress(
        companyKnownAddressId: $companyKnownAddressId
        alias: $alias
      ) {
        id
        name
        alias
        postalCode
        city
      }
    }
  }
`;
export const TERMINATE_KNOWN_ADDRESS_MUTATION = gql`
  mutation terminateKnownAddress($companyKnownAddressId: Int!) {
    locations {
      terminateKnownAddress(companyKnownAddressId: $companyKnownAddressId) {
        success
      }
    }
  }
`;
export const VALIDATE_MISSION_MUTATION = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
  ${FULL_MISSION_FRAGMENT}
  mutation validateMission(
    $missionId: Int!
    $usersIds: [Int]!
    $creationTime: TimeStamp
    $activityItems: [BulkActivityItem]
    $expendituresCancelIds: [Int]
    $expendituresInputs: [BulkExpenditureItem]
  ) {
    activities {
      validateMission(
        missionId: $missionId
        usersIds: $usersIds
        creationTime: $creationTime
        activityItems: $activityItems
        expendituresCancelIds: $expendituresCancelIds
        expendituresInputs: $expendituresInputs
      ) {
        ...FullMissionData
      }
    }
  }
`;
export const LOG_EXPENDITURE_MUTATION = gql`
  mutation logExpenditure(
    $type: ExpenditureTypeEnum!
    $missionId: Int!
    $userId: Int
    $spendingDate: Date!
    $creationTime: TimeStamp
  ) {
    activities {
      logExpenditure(
        type: $type
        missionId: $missionId
        userId: $userId
        spendingDate: $spendingDate
        creationTime: $creationTime
      ) {
        id
        type
        missionId
        userId
        spendingDate
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

export const EDIT_COMPANY_SETTINGS_MUTATION = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  mutation editCompanySettings(
    $companyId: Int!
    $allowTeamMode: Boolean
    $requireKilometerData: Boolean
    $requireExpenditures: Boolean
    $requireSupportActivity: Boolean
    $allowTransfers: Boolean
    $requireMissionName: Boolean
  ) {
    editCompanySettings(
      companyId: $companyId
      allowTeamMode: $allowTeamMode
      requireKilometerData: $requireKilometerData
      requireExpenditures: $requireExpenditures
      requireSupportActivity: $requireSupportActivity
      allowTransfers: $allowTransfers
      requireMissionName: $requireMissionName
    ) {
      id
      ...CompanySettings
    }
  }
`;

export const UPDATE_MISSION_VEHICLE_MUTATION = gql`
  mutation updateMissionVehicle(
    $missionId: Int!
    $vehicleId: Int
    $vehicleRegistrationNumber: String
  ) {
    activities {
      updateMissionVehicle(
        missionId: $missionId
        vehicleId: $vehicleId
        vehicleRegistrationNumber: $vehicleRegistrationNumber
      ) {
        id
        name
        registrationNumber
      }
    }
  }
`;

export const REGISTER_KILOMETER_AT_LOCATION = gql`
  mutation registerKilometerAtLocation(
    $missionLocationId: Int!
    $kilometerReading: Int!
  ) {
    activities {
      registerKilometerAtLocation(
        missionLocationId: $missionLocationId
        kilometerReading: $kilometerReading
      ) {
        success
      }
    }
  }
`;

export const MISSION_QUERY = gql`
  ${FULL_MISSION_FRAGMENT}
  query mission($id: Int!) {
    mission(id: $id) {
      ...FullMissionData
    }
  }
`;

export const OAUTH_TOKEN_QUERY = gql`
  query userOAuthToken($userId: Int!) {
    oauthAccessTokens(userId: $userId) {
      id
      token
      clientName
    }
  }
`;

export const CREATE_OAUTH_TOKEN_MUTATION = gql`
  mutation createOauthToken($userId: Int!, $clientId: Int!) {
    createOauthToken(userId: $userId, clientId: $clientId) {
      id
      token
      clientName
      clientId
    }
  }
`;

export const REVOKE_OAUTH_TOKEN_MUTATION = gql`
  mutation revokeOauthToken($tokenId: Int!) {
    revokeOauthToken(tokenId: $tokenId) {
      clientName
      token
      id
    }
  }
`;

export const DISABLE_WARNING_MUTATION = gql`
  mutation disableValidationWarning($warningName: WarningToDisableTypeEnum!) {
    account {
      disableWarning(warningName: $warningName) {
        success
      }
    }
  }
`;

export const CHANGE_MISSION_NAME_MUTATION = gql`
  mutation changeMissionName($name: String!, $missionId: Int!) {
    activities {
      changeMissionName(name: $name, missionId: $missionId) {
        id
        name
      }
    }
  }
`;

export const CONTROLLER_SCAN_CODE = gql`
  mutation controllerScanCode($jwtToken: String!) {
    controllerScanCode(jwtToken: $jwtToken) {
      id
      qrCodeGenerationTime
    }
  }
`;

export const CONTROLLER_SAVE_CONTROL_BULLETIN = gql`
  ${CONTROL_BULLETIN_FRAGMENT}
  mutation controllerSaveControlBulletin(
    $controlId: Int
    $userFirstName: String
    $userLastName: String
    $userBirthDate: Date
    $userNationality: String
    $licPaperPresented: Boolean
    $siren: String
    $companyName: String
    $companyAddress: String
    $vehicleRegistrationNumber: String
    $vehicleRegistrationCountry: String
    $missionAddressBegin: String
    $missionAddressEnd: String
    $transportType: String
    $articlesNature: String
    $licenseNumber: String
    $licenseCopyNumber: String
    $observation: String
  ) {
    controllerSaveControlBulletin(
      controlId: $controlId
      userFirstName: $userFirstName
      userLastName: $userLastName
      userNationality: $userNationality
      userBirthDate: $userBirthDate
      licPaperPresented: $licPaperPresented
      siren: $siren
      companyName: $companyName
      companyAddress: $companyAddress
      vehicleRegistrationNumber: $vehicleRegistrationNumber
      vehicleRegistrationCountry: $vehicleRegistrationCountry
      missionAddressBegin: $missionAddressBegin
      missionAddressEnd: $missionAddressEnd
      transportType: $transportType
      articlesNature: $articlesNature
      licenseNumber: $licenseNumber
      licenseCopyNumber: $licenseCopyNumber
      observation: $observation
    ) {
      id
      controlBulletin {
        ...ControlBulletin
      }
    }
  }
`;

export const CONTROLLER_USER_CONTROLS_QUERY = gql`
  query controllerUser($id: Int!, $fromDate: Date, $toDate: Date) {
    controllerUser(id: $id) {
      controls(fromDate: $fromDate, toDate: $toDate) {
        id
        controlType
        user {
          firstName
          lastName
        }
        qrCodeGenerationTime
        creationTime
        companyName
        vehicleRegistrationNumber
        nbControlledDays
      }
    }
  }
`;

export function buildLogLocationPayloadFromAddress(
  address,
  missionId,
  isStart,
  kilometerReading
) {
  const payload = {
    missionId,
    type: isStart ? "mission_start_location" : "mission_end_location",
    kilometerReading,
    creationTime: nowMilliseconds()
  };

  return {
    ...payload,
    ...buildBackendPayloadForAddress(address)
  };
}

export const HTTP_QUERIES = {
  subscribeToNewsletter: {
    method: "POST",
    endpoint: "/contacts/subscribe-to-newsletter"
  },
  verifyXlsxSignature: {
    method: "POST",
    endpoint: "/control/verify-xlsx-signature"
  },
  generateUserReadToken: {
    method: "POST",
    endpoint: "/control/generate-user-read-token"
  },
  refresh: {
    method: "POST",
    endpoint: "/token/refresh"
  },
  logout: {
    method: "POST",
    endpoint: "/token/logout"
  },
  excelExport: {
    method: "POST",
    endpoint: "/companies/download_activity_report"
  },
  userC1bExport: {
    method: "POST",
    endpoint: "/users/generate_tachograph_file"
  },
  companyC1bExport: {
    method: "POST",
    endpoint: "/companies/generate_tachograph_files"
  },
  pdfExport: {
    method: "POST",
    endpoint: "/users/generate_pdf_export"
  },
  missionExport: {
    method: "POST",
    endpoint: "/users/generate_mission_export"
  },
  missionControlExport: {
    method: "POST",
    endpoint: "/users/generate_mission_control_export"
  },
  oauthAuthorize: {
    method: "GET",
    endpoint: "/oauth/authorize"
  },
  webinars: {
    method: "GET",
    endpoint: "/next-webinars"
  },
  controlExcelExport: {
    method: "POST",
    endpoint: "/controllers/download_control_report"
  },
  controlC1BExport: {
    method: "POST",
    endpoint: "/controllers/generate_tachograph_files"
  }
};

export const CHECK_AUTH_QUERY = gql`
  query checkAuthentication {
    checkAuth {
      success
      userId
    }
  }
`;

export const DISMISS_THIRD_PARTY_EMPLOYMENT_TOKEN_MUTATION = gql`
  mutation dismissEmploymentToken($employmentId: Int!, $clientId: Int!) {
    dismissEmploymentToken(employmentId: $employmentId, clientId: $clientId) {
      success
    }
  }
`;

export const DISMISS_THIRD_PARTY_COMPANY_TOKEN_MUTATION = gql`
  mutation dismissCompanyToken($companyId: Int!, $clientId: Int!) {
    dismissCompanyToken(companyId: $companyId, clientId: $clientId) {
      id
      name
    }
  }
`;

export const GENERATE_THIRD_PARTY_COMPANY_TOKEN_MUTATION = gql`
  mutation generateCompanyToken($companyId: Int!, $clientId: Int!) {
    generateCompanyToken(companyId: $companyId, clientId: $clientId) {
      id
      name
    }
  }
`;

export const OAUTH_CLIENT_QUERY = gql`
  query oauthClient($clientId: Int!) {
    oauthClient(clientId: $clientId) {
      id
      name
    }
  }
`;

export const THIRD_PARTY_CLIENT_EMPLOYMENT_QUERY = gql`
  query clientEmploymentLink(
    $clientId: Int!
    $employmentId: Int!
    $invitationToken: String!
  ) {
    clientEmploymentLink(
      clientId: $clientId
      employmentId: $employmentId
      invitationToken: $invitationToken
    ) {
      clientName
      employment {
        isAcknowledged
        company {
          name
        }
        user {
          email
          hasConfirmedEmail
          hasActivatedEmail
        }
      }
    }
  }
`;

export const THIRD_PARTY_CLIENT_EMPLOYMENT_ACCEPT = gql`
  mutation generateEmploymentToken(
    $clientId: Int!
    $employmentId: Int!
    $invitationToken: String!
  ) {
    generateEmploymentToken(
      clientId: $clientId
      employmentId: $employmentId
      invitationToken: $invitationToken
    ) {
      success
    }
  }
`;
