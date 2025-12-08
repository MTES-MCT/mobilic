import { gql } from "graphql-tag";
import {
  COMPANY_SETTINGS_FRAGMENT,
  FRAGMENT_ACTIVITY,
  FRAGMENT_LOCATION_FULL,
  FULL_EMPLOYMENT_FRAGMENT,
  WORK_DAYS_DATA_FRAGMENT
} from "./apiFragments";

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
        isAuto
        justification
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

export const ADMIN_COMPANIES_LIST_QUERY = gql`
  query adminCompaniesList($id: Int!) {
    user(id: $id) {
      adminedCompanies {
        id
        name
        siren
        phoneNumber
        nbWorkers
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

export const ADMIN_COMPANIES_QUERY = gql`
  ${WORK_DAYS_DATA_FRAGMENT}
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
  ${FRAGMENT_ACTIVITY}
  ${FULL_EMPLOYMENT_FRAGMENT}
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
        nbWorkers
        ...CompanySettings
        business {
          transportType
          businessType
        }
        users(fromDate: $activityAfter) {
          id
          firstName
          lastName
        }
        currentUsers {
          id
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
              submitter {
                firstName
                lastName
              }
              isHoliday
              validations {
                submitterId
                receptionTime
                isAdmin
                isAuto
                justification
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
                ...Activity
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
              pastRegistrationJustification
            }
          }
        }
        vehicles {
          id
          registrationNumber
          alias
        }
        employments {
          ...FullEmploymentData
          shouldSeeCertificateInfo
          shouldForceNbWorkerInfo
        }
      }
    }
  }
`;

export const ADMIN_DELETED_MISSIONS_QUERY = gql`
  ${FRAGMENT_LOCATION_FULL}
  ${FRAGMENT_ACTIVITY}
  query refreshDeletedMissions($id: Int!, $companyIds: [Int], $first: Int) {
    user(id: $id) {
      adminedCompanies(companyIds: $companyIds) {
        id
        missionsDeleted(first: $first) {
          edges {
            node {
              id
              name
              submitterId
              deletedAt
              deletedBy
              isHoliday
              validations {
                submitterId
                receptionTime
                isAdmin
                isAuto
                justification
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
              activities(includeDismissedActivities: true) {
                ...Activity
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

export const ADMIN_QUERY_USER_WORK_DAY = gql`
  ${WORK_DAYS_DATA_FRAGMENT}
  query adminUserWorkDay(
    $adminId: Int!
    $companyId: Int!
    $day: Date
    $userId: Int!
  ) {
    user(id: $adminId) {
      adminedCompanies(companyIds: [$companyId]) {
        id
        workDays(fromDate: $day, untilDate: $day, userIds: [$userId]) {
          ...WorkDayData
        }
      }
    }
  }
`;

export const ADMIN_USERS_SINCE_DATE = gql`
  query adminCompanies($id: Int!, $activityAfter: Date, $companyIds: [Int]) {
    user(id: $id) {
      adminedCompanies(companyIds: $companyIds) {
        id
        users(fromDate: $activityAfter) {
          id
          firstName
          lastName
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
  mutation ($id: Int!, $alias: String) {
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
    $allowOtherTask: Boolean
    $otherTaskLabel: String
  ) {
    editCompanySettings(
      companyId: $companyId
      allowTeamMode: $allowTeamMode
      requireKilometerData: $requireKilometerData
      requireExpenditures: $requireExpenditures
      requireSupportActivity: $requireSupportActivity
      allowTransfers: $allowTransfers
      requireMissionName: $requireMissionName
      allowOtherTask: $allowOtherTask
      otherTaskLabel: $otherTaskLabel
    ) {
      id
      ...CompanySettings
    }
  }
`;

export const INVITE_COMPANIES_MUTATION = gql`
  mutation inviteCompanies($companyId: Int!, $emails: [Email]!) {
    inviteCompanies(companyId: $companyId, emails: $emails) {
      success
    }
  }
`;

export const UPDATE_COMPANY_DETAILS = gql`
  mutation UpdateCompanyDetails(
    $companyId: Int!
    $newName: String
    $newPhoneNumber: String
    $newNbWorkers: Int
  ) {
    updateCompanyDetails(
      companyId: $companyId
      newName: $newName
      newPhoneNumber: $newPhoneNumber
      newNbWorkers: $newNbWorkers
    ) {
      id
      name
      phoneNumber
      nbWorkers
      business {
        businessType
        transportType
      }
    }
  }
`;

export const UPDATE_COMPANY_DETAILS_WITH_BUSINESS_TYPE = gql`
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation UpdateCompanyDetailsWithBusinessType(
    $companyId: Int!
    $newName: String
    $newPhoneNumber: String
    $newBusinessType: String
    $applyBusinessTypeToEmployees: Boolean
    $newNbWorkers: Int
  ) {
    updateCompanyDetails(
      companyId: $companyId
      newName: $newName
      newPhoneNumber: $newPhoneNumber
      newBusinessType: $newBusinessType
      applyBusinessTypeToEmployees: $applyBusinessTypeToEmployees
      newNbWorkers: $newNbWorkers
    ) {
      id
      name
      phoneNumber
      nbWorkers
      business {
        businessType
        transportType
      }
      employments {
        ...FullEmploymentData
      }
    }
  }
`;

export const ADMIN_COMPANY_REGULATORY_ALERTS_SUMMARY_QUERY = gql`
  query regulatoryAlertsSummary(
    $id: Int!
    $companyIds: [Int]
    $month: ShortMonth!
    $uniqueUserId: Int
    $teamId: Int
  ) {
    user(id: $id) {
      adminedCompanies(companyIds: $companyIds) {
        id
        regulatoryAlertsRecap(
          month: $month
          uniqueUserId: $uniqueUserId
          teamId: $teamId
        ) {
          month
          hasAnyComputation
          totalNbAlerts
          totalNbAlertsPreviousMonth
          dailyAlerts {
            alertsType
            nbAlerts
            days
          }
          weeklyAlerts {
            alertsType
            nbAlerts
            days
          }
        }
      }
    }
  }
`;
