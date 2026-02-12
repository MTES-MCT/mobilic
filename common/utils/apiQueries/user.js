import { gql } from "graphql-tag";
import {
  COMPANY_SETTINGS_FRAGMENT,
  FRAGMENT_LOCATION_FULL,
  FULL_MISSION_FRAGMENT,
  NOTIFICATION_FRAGMENT,
  REGULATION_COMPUTATIONS_FRAGMENT,
  USER_AGREEMENT,
  USER_CONTROL_SUMMARY_FRAGMENT
} from "./apiFragments";

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
  ${FULL_MISSION_FRAGMENT}
  query readUser {
    me {
      id
      firstName
      lastName
      birthDate
      email
      missions(includeDeletedMissions: true) {
        edges {
          node {
            ...FullMissionData
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
      missions(
        fromTime: $fromTime
        untilTime: $untilTime
        includeDeletedMissions: true
      ) {
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
            validations {
              isAdmin
            }
            isHoliday
          }
        }
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

export const USER_CONTROLS_QUERY = gql`
  ${USER_CONTROL_SUMMARY_FRAGMENT}
  query userControls($userId: Int!) {
    user(id: $userId) {
      userControls {
        ...UserControlSummary
      }
    }
  }
`;

export const CURRENT_EMPLOYMENTS_QUERY = gql`
  query currentEmployments($id: Int!) {
    user(id: $id) {
      id
      currentEmployments {
        id
        startDate
        isAcknowledged
        hasAdminRights
        company {
          id
          name
          siren
          sirets
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
          vehicles {
            id
            name
            registrationNumber
            lastKilometerReading
          }
        }
        team {
          id
          name
          vehicles {
            id
            name
            registrationNumber
            lastKilometerReading
          }
          knownAddresses {
            id
            alias
            name
            postalCode
            city
          }
        }
      }
    }
  }
`;

export const USER_QUERY = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FULL_MISSION_FRAGMENT}
  ${USER_AGREEMENT}
  ${NOTIFICATION_FRAGMENT}
  query user($id: Int!, $activityAfter: TimeStamp) {
    user(id: $id) {
      id
      creationTime
      surveyActions {
        surveyId
        creationTime
        action
      }
      firstName
      lastName
      gender
      birthDate
      phoneNumber
      timezoneName
      shouldUpdatePassword
      email
      hasConfirmedEmail
      hasActivatedEmail
      disabledWarnings
      missions(fromTime: $activityAfter, includeDeletedMissions: true) {
        edges {
          node {
            ...FullMissionData
          }
        }
      }
      employments(includePending: true) {
        id
        startDate
        endDate
        isAcknowledged
        hasAdminRights
        hideEmail
        business {
          transportType
          businessType
        }
        authorizedClients {
          id
          name
        }
        company {
          id
          name
          siren
          sirets
          hasNoActiveAdmins
          hasCeasedActivity
          ...CompanySettings
          currentCompanyCertification {
            isCertified
            certificationMedal
          }
        }
      }
      userAgreementStatus {
        ...UserAgreementData
      }
      notifications {
        ...NotificationData
      }
    }
  }
`;
