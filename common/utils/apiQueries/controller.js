import { gql } from "graphql-tag";
import {
  COMPANY_SETTINGS_FRAGMENT,
  CONTROL_BULLETIN_FRAGMENT,
  CONTROL_DATA_FRAGMENT,
  CONTROLLER_USER_FRAGMENT,
  FRAGMENT_LOCATION_FULL,
  FULL_MISSION_FRAGMENT,
  OBSERVED_INFRACTIONS_FRAGMENT,
  REGULATION_COMPUTATIONS_FRAGMENT
} from "./apiFragments";

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
  }
`;

export const CONTROLLER_READ_CONTROL_DATA_NO_LIC = gql`
  ${CONTROL_BULLETIN_FRAGMENT}
  ${CONTROL_DATA_FRAGMENT}
  ${OBSERVED_INFRACTIONS_FRAGMENT}
  query readControlDataNoLic($controlId: Int!) {
    controlData(controlId: $controlId) {
      ...ControlData
      controlBulletin {
        ...ControlBulletin
      }
      observedInfractions {
        ...ObservedInfractions
      }
      reportedInfractionsLastUpdateTime
      canTakePictures
      pictures {
        url
      }
      picturesExpiryDate
      businessTypeDuringControl {
        id
        transportType
        businessType
      }
    }
  }
`;

export const CONTROLLER_READ_CONTROL_PICTURES = gql`
  query readControlPictures($controlId: Int!) {
    controlData(controlId: $controlId) {
      pictures {
        url
      }
    }
  }
`;

export const CONTROLLER_READ_CONTROL_DATA = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FULL_MISSION_FRAGMENT}
  ${REGULATION_COMPUTATIONS_FRAGMENT}
  ${OBSERVED_INFRACTIONS_FRAGMENT}
  ${CONTROL_BULLETIN_FRAGMENT}
  ${CONTROL_DATA_FRAGMENT}
  query readControlData($controlId: Int!) {
    controlData(controlId: $controlId) {
      ...ControlData
      historyStartDate
      controlBulletin {
        ...ControlBulletin
      }
      missions {
        ...FullMissionData
      }
      employments {
        id
        startDate
        isAcknowledged
        hasAdminRights
        endDate
        business {
          transportType
          businessType
        }
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
          currentAdmins {
            email
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
      observedInfractions {
        ...ObservedInfractions
      }
      reportedInfractionsLastUpdateTime
      businessTypeDuringControl {
        id
        transportType
        businessType
      }
    }
  }
`;

export const SEND_CONTROL_BULLETIN_EMAIL_MUTATION = gql`
  mutation SendControlBulletinEmail(
    $controlId: String!
    $adminEmails: [Email!]
  ) {
    sendControlBulletinEmail(controlId: $controlId, adminEmails: $adminEmails) {
      success
      nbEmailsSent
    }
  }
`;

export const CONTROL_LOCATION_QUERY = gql`
  query controlLocation($department: String!) {
    controlLocation(department: $department) {
      id
      department
      commune
      label
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

export const CONTROLLER_USER_QUERY = gql`
  ${CONTROLLER_USER_FRAGMENT}
  query controllerUser($id: Int!) {
    controllerUser(id: $id) {
      ...ControllerUser
    }
  }
`;

export const CONTROLLER_CHANGE_GRECO_ID = gql`
  ${CONTROLLER_USER_FRAGMENT}
  mutation controllerChangeGrecoId($grecoId: String!) {
    controllerChangeGrecoId(grecoId: $grecoId) {
      ...ControllerUser
    }
  }
`;

export const CONTROLLER_ADD_CONTROL_NOTE = gql`
  mutation controllerAddControlNote($controlId: Int!, $content: String!) {
    controllerAddControlNote(controlId: $controlId, content: $content) {
      note
    }
  }
`;

export const CONTROLLER_UPDATE_CONTROL_TIME = gql`
  mutation controllerUpdateControlTime($controlId: Int!, $newTime: TimeStamp!) {
    controllerUpdateControlTime(controlId: $controlId, newTime: $newTime) {
      controlTime
    }
  }
`;

export const CONTROLLER_SAVE_CONTROL_BULLETIN = gql`
  ${CONTROL_BULLETIN_FRAGMENT}
  ${CONTROL_DATA_FRAGMENT}
  mutation controllerSaveControlBulletin(
    $controlId: Int
    $type: String
    $userFirstName: String
    $userLastName: String
    $userBirthDate: Date
    $userNationality: String
    $siren: String
    $companyName: String
    $companyAddress: String
    $locationDepartment: String
    $locationCommune: String
    $locationLieu: String
    $locationId: Int
    $vehicleRegistrationNumber: String
    $vehicleRegistrationCountry: String
    $missionAddressBegin: String
    $missionAddressEnd: String
    $transportType: String
    $articlesNature: String
    $licenseNumber: String
    $licenseCopyNumber: String
    $isVehicleImmobilized: Boolean
    $observation: String
    $businessType: String
    $isDayPageFilled: Boolean
    $deliveredByHand: Boolean
  ) {
    controllerSaveControlBulletin(
      controlId: $controlId
      type: $type
      userFirstName: $userFirstName
      userLastName: $userLastName
      userNationality: $userNationality
      userBirthDate: $userBirthDate
      siren: $siren
      companyName: $companyName
      companyAddress: $companyAddress
      locationDepartment: $locationDepartment
      locationCommune: $locationCommune
      locationLieu: $locationLieu
      locationId: $locationId
      vehicleRegistrationNumber: $vehicleRegistrationNumber
      vehicleRegistrationCountry: $vehicleRegistrationCountry
      missionAddressBegin: $missionAddressBegin
      missionAddressEnd: $missionAddressEnd
      transportType: $transportType
      articlesNature: $articlesNature
      licenseNumber: $licenseNumber
      licenseCopyNumber: $licenseCopyNumber
      isVehicleImmobilized: $isVehicleImmobilized
      observation: $observation
      businessType: $businessType
      isDayPageFilled: $isDayPageFilled
      deliveredByHand: $deliveredByHand
    ) {
      ...ControlData
      controlBulletin {
        ...ControlBulletin
      }
    }
  }
`;

export const CONTROLLER_UPDATE_DELIVERY_STATUS = gql`
  ${CONTROL_DATA_FRAGMENT}
  mutation controllerUpdateDeliveryStatus(
    $controlId: Int!
    $deliveredByHand: Boolean!
  ) {
    controllerUpdateDeliveryStatus(
      controlId: $controlId
      deliveredByHand: $deliveredByHand
    ) {
      ...ControlData
    }
  }
`;

export const CONTROLLER_SAVE_REPORTED_INFRACTIONS = gql`
  ${OBSERVED_INFRACTIONS_FRAGMENT}
  mutation controllerSaveReportedInfractions(
    $controlId: Int
    $reportedInfractions: [ReportedInfractionInput]
  ) {
    controllerSaveReportedInfractions(
      controlId: $controlId
      reportedInfractions: $reportedInfractions
    ) {
      observedInfractions {
        ...ObservedInfractions
      }
      reportedInfractionsLastUpdateTime
    }
  }
`;

export const CONTROLLER_USER_CONTROLS_QUERY = gql`
  ${CONTROL_DATA_FRAGMENT}
  query controllerUser(
    $id: Int!
    $fromDate: Date
    $toDate: Date
    $limit: Int
    $controlsType: String
  ) {
    controllerUser(id: $id) {
      controls(
        fromDate: $fromDate
        toDate: $toDate
        limit: $limit
        controlsType: $controlsType
      ) {
        ...ControlData
      }
    }
  }
`;
