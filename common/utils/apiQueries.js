import { gql } from "@apollo/client/core";

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
            siren
            allowTeamMode
            requireKilometerData
            requireExpenditures
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

export const USER_READ_QUERY = gql`
  query readUser($token: String!) {
    userFromReadToken(token: $token) {
      tokenInfo {
        creationTime
        validUntil
        creationDay
        historyStartDay
      }
      user {
        id
        firstName
        lastName
        birthDate
        email
        missions {
          id
          name
          company {
            id
            name
            siren
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
          }
          activities {
            id
            type
            missionId
            startTime
            endTime
            userId
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
        currentEmployments {
          id
          startDate
          isAcknowledged
          isPrimary
          hasAdminRights
          company {
            id
            name
            siren
            vehicles {
              id
              name
              registrationNumber
            }
          }
        }
      }
    }
  }
`;
export const ADMIN_COMPANIES_QUERY = gql`
  query adminCompanies(
    $id: Int!
    $activityAfter: Date
    $workDaysLimit: Int
    $nonValidatedMissionsAfter: Date
  ) {
    user(id: $id) {
      adminedCompanies {
        id
        name
        allowTeamMode
        requireKilometerData
        requireExpenditures
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
        workDays(fromDate: $activityAfter, limit: $workDaysLimit) {
          user {
            id
            firstName
            lastName
          }
          missionNames
          startTime
          endTime
          expenditures
          serviceDuration
          totalWorkDuration
          activityDurations
        }
        missions(
          fromTime: $nonValidatedMissionsAfter
          onlyNonValidatedMissions: true
        ) {
          id
          name
          validations {
            submitterId
            receptionTime
          }
          context
          expenditures {
            id
            type
            userId
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
            user {
              id
              firstName
              lastName
            }
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
        vehicles {
          id
          registrationNumber
          name
        }
        employments {
          id
          startDate
          endDate
          isAcknowledged
          isPrimary
          email
          hasAdminRights
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
export const GET_EMPLOYMENT_QUERY = gql`
  query getInvitation($token: String!) {
    employment(token: $token) {
      id
      startDate
      isPrimary
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
        isPrimary
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
        isPrimary
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
        isPrimary
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
  mutation createMission(
    $name: String
    $companyId: Int
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
          allowTeamMode
          requireKilometerData
          requireExpenditures
        }
      }
    }
  }
`;
export const END_MISSION_MUTATION = gql`
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
          allowTeamMode
          requireKilometerData
          requireExpenditures
        }
        activities {
          id
          type
          missionId
          userId
          startTime
          endTime
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
  ) {
    activities {
      logLocation(
        companyKnownAddressId: $companyKnownAddressId
        missionId: $missionId
        type: $type
        geoApiData: $geoApiData
        manualAddress: $manualAddress
        kilometerReading: $kilometerReading
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
    $geoApiData: GenericScalar!
    $alias: String
    $companyId: Int!
  ) {
    locations {
      createKnownAddress(
        geoApiData: $geoApiData
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
  mutation validateMission($missionId: Int!, $userId: Int) {
    activities {
      validateMission(missionId: $missionId, userId: $userId) {
        isAdmin
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
            allowTeamMode
            requireKilometerData
            requireExpenditures
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
  mutation editCompanySettings(
    $companyId: Int!
    $allowTeamMode: Boolean
    $requireKilometerData: Boolean
    $requireExpenditures: Boolean
  ) {
    editCompanySettings(
      companyId: $companyId
      allowTeamMode: $allowTeamMode
      requireKilometerData: $requireKilometerData
      requireExpenditures: $requireExpenditures
    ) {
      id
      allowTeamMode
      requireKilometerData
      requireExpenditures
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
