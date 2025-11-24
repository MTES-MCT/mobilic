import { gql } from "graphql-tag";
import {
  COMPANY_SETTINGS_FRAGMENT,
  FRAGMENT_LOCATION_FULL,
  FULL_MISSION_FRAGMENT
} from "./apiFragments";
import { nowMilliseconds } from "../time";
import { buildBackendPayloadForAddress } from "../addresses";

export const LOG_HOLIDAY_MUTATION = gql`
  ${FULL_MISSION_FRAGMENT}
  mutation logHoliday(
    $companyId: Int!
    $userId: Int
    $startTime: TimeStamp!
    $endTime: TimeStamp!
    $title: String!
    $comment: String
  ) {
    activities {
      logHoliday(
        companyId: $companyId
        userId: $userId
        startTime: $startTime
        endTime: $endTime
        title: $title
        comment: $comment
      ) {
        ...FullMissionData
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
    $pastRegistrationJustification: String
  ) {
    activities {
      createMission(
        name: $name
        companyId: $companyId
        context: $context
        vehicleId: $vehicleId
        vehicleRegistrationNumber: $vehicleRegistrationNumber
        creationTime: $creationTime
        pastRegistrationJustification: $pastRegistrationJustification
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
    $pastRegistrationJustification: String
  ) {
    activities {
      endMission(
        endTime: $endTime
        missionId: $missionId
        userId: $userId
        creationTime: $creationTime
        pastRegistrationJustification: $pastRegistrationJustification
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
    $justification: OverValidationJustificationEnum
  ) {
    activities {
      validateMission(
        missionId: $missionId
        usersIds: $usersIds
        creationTime: $creationTime
        activityItems: $activityItems
        expendituresCancelIds: $expendituresCancelIds
        expendituresInputs: $expendituresInputs
        justification: $justification
      ) {
        ...FullMissionData
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
    kilometerReading,
    creationTime: nowMilliseconds()
  };

  return {
    ...payload,
    ...buildBackendPayloadForAddress(address)
  };
}

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
