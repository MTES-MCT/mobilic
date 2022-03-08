import { gql } from "@apollo/client/core";
import { buildBackendPayloadForAddress } from "./addresses";

export const ALL_MISSION_RESOURCES_WITH_HISTORY_QUERY = gql`
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
        id
        receptionTime
        submitter {
          id
          firstName
          lastName
        }
        missionId
        name
        alias
        postalCode
        city
        kilometerReading
      }
      endLocation {
        id
        receptionTime
        submitter {
          id
          firstName
          lastName
        }
        missionId
        name
        alias
        postalCode
        city
        kilometerReading
      }
    }
  }
`;

export const COMPANY_SETTINGS_FRAGMENT = gql`
  fragment CompanySettings on Company {
    settings {
      allowTeamMode
      requireKilometerData
      requireSupportActivity
      requireExpenditures
      requireMissionName
    }
  }
`;

export const FULL_MISSION_FRAGMENT = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  fragment FullMissionData on Mission {
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
    context
    expenditures {
      id
      type
      missionId
      userId
      receptionTime
      spendingDate
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
      id
      name
      alias
      postalCode
      city
      kilometerReading
    }
    endLocation {
      id
      name
      alias
      postalCode
      city
      kilometerReading
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
    $subscribeToNewsletter: Boolean
  ) {
    signUp {
      user(
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
        inviteToken: $inviteToken
        subscribeToNewsletter: $subscribeToNewsletter
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
  ${COMPANY_SETTINGS_FRAGMENT}
  mutation companySignUp($siren: Int!, $usualName: String!, $sirets: [String]) {
    signUp {
      company(siren: $siren, usualName: $usualName, sirets: $sirets) {
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
  query sirenInfo($siren: Int!) {
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

export const USER_READ_QUERY = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
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
              id
              name
              alias
              postalCode
              city
              kilometerReading
            }
            endLocation {
              id
              name
              alias
              postalCode
              city
              kilometerReading
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

export const WORK_DAYS_DATA_FRAGMENT = gql`
  fragment WorkDayData on WorkDayConnection {
    edges {
      node {
        user {
          id
          firstName
          lastName
        }
        day
        missionNames
        startTime
        lastActivityStartTime
        endTime
        expenditures
        serviceDuration
        totalWorkDuration
        activityDurations
      }
    }
    pageInfo {
      hasNextPage
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

export const ADMIN_COMPANIES_QUERY = gql`
  ${WORK_DAYS_DATA_FRAGMENT}
  ${COMPANY_SETTINGS_FRAGMENT}
  query adminCompanies(
    $id: Int!
    $activityAfter: Date
    $workDaysLimit: Int
    $endedMissionsAfter: TimeStamp
    $onlyFirst: Boolean
    $companyIds: [Int]
  ) {
    allAdminedCompanies: user(id: $id) {
      adminedCompanies(onlyFirst: false) {
        id
        name
        ...CompanySettings
      }
    }
    selectedAdminedCompanies: user(id: $id) {
      adminedCompanies(onlyFirst: $onlyFirst, companyIds: $companyIds) {
        id
        name
        ...CompanySettings
        users {
          id
          firstName
          lastName
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
                id
                alias
                name
                postalCode
                city
                kilometerReading
              }
              endLocation {
                id
                alias
                name
                postalCode
                city
                kilometerReading
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

// export const ADMIN_COMPANIES_QUERY = gql`
//   query adminCompanies($id: Int!) {
//     user(id: $id) {
//       adminedCompanies {
//         id
//         name
//       }
//     }
//   }
// `;

export const ADMIN_WORK_DAYS_QUERY = gql`
  ${WORK_DAYS_DATA_FRAGMENT}
  query adminCompanies($id: Int!, $activityAfter: Date, $activityBefore: Date) {
    user(id: $id) {
      adminedCompanies {
        id
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
        email
        hasAdminRights
        company {
          id
          name
          siren
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
        lastSubmitterId
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
        lastSubmitterId
      }
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
  ) {
    activities {
      createMission(
        name: $name
        companyId: $companyId
        context: $context
        vehicleId: $vehicleId
        vehicleRegistrationNumber: $vehicleRegistrationNumber
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
  mutation endMission($endTime: TimeStamp!, $missionId: Int!, $userId: Int) {
    activities {
      endMission(endTime: $endTime, missionId: $missionId, userId: $userId) {
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
          id
          alias
          name
          postalCode
          city
          kilometerReading
        }
        endLocation {
          id
          alias
          name
          postalCode
          city
          kilometerReading
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
  mutation logLocation(
    $companyKnownAddressId: Int
    $type: LocationEntryTypeEnum!
    $missionId: Int!
    $geoApiData: GenericScalar
    $manualAddress: String
    $kilometerReading: Int
    $overrideExisting: Boolean
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
      ) {
        id
        alias
        name
        postalCode
        city
        kilometerReading
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
  mutation validateMission($missionId: Int!, $userId: Int) {
    activities {
      validateMission(missionId: $missionId, userId: $userId) {
        isAdmin
        submitterId
        receptionTime
        userId
        mission {
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
          company {
            id
            name
            siren
            ...CompanySettings
          }
          startLocation {
            id
            alias
            name
            postalCode
            city
            kilometerReading
          }
          endLocation {
            id
            alias
            name
            postalCode
            city
            kilometerReading
          }
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
    $spendingDate: Date!
  ) {
    activities {
      logExpenditure(
        type: $type
        missionId: $missionId
        userId: $userId
        spendingDate: $spendingDate
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
    $requireMissionName: Boolean
  ) {
    editCompanySettings(
      companyId: $companyId
      allowTeamMode: $allowTeamMode
      requireKilometerData: $requireKilometerData
      requireExpenditures: $requireExpenditures
      requireSupportActivity: $requireSupportActivity
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

export function buildLogLocationPayloadFromAddress(
  address,
  missionId,
  isStart,
  kilometerReading
) {
  const payload = {
    missionId,
    type: isStart ? "mission_start_location" : "mission_end_location",
    kilometerReading
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
  oauthAuthorize: {
    method: "GET",
    endpoint: "/oauth/authorize"
  },
  webinars: {
    method: "GET",
    endpoint: "/next-webinars"
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
