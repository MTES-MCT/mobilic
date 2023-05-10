import { gql } from "graphql-tag";

export const COMPANY_SETTINGS_FRAGMENT = gql`
  fragment CompanySettings on Company {
    settings {
      allowTeamMode
      requireKilometerData
      requireSupportActivity
      allowTransfers
      requireExpenditures
      requireMissionName
    }
  }
`;

export const FRAGMENT_LOCATION_FULL = gql`
  fragment FullLocation on LocationEntry {
    id
    name
    alias
    postalCode
    city
    kilometerReading
  }
`;
export const FULL_MISSION_FRAGMENT = gql`
  ${COMPANY_SETTINGS_FRAGMENT}
  ${FRAGMENT_LOCATION_FULL}
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
      ...FullLocation
    }
    endLocation {
      ...FullLocation
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

export const REGULATION_COMPUTATIONS_FRAGMENT = gql`
  fragment RegulationComputations on RegulationComputationByDayOutput {
    day
    regulationComputations {
      day
      submitterType
      regulationChecks {
        type
        label
        description
        regulationRule
        unit
        alert {
          extra
        }
      }
    }
  }
`;

export const FULL_TEAM_FRAGMENT = gql`
  fragment FullTeamData on Team {
    id
    name
    creationTime
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
    vehicles {
      id
      name
    }
    knownAddresses {
      id
      alias
      name
      postalCode
      city
    }
  }
`;

export const CONTROL_BULLETIN_FRAGMENT = gql`
  fragment ControlBulletin on ControlBulletin {
    id
    userFirstName
    userLastName
    userBirthDate
    userNationality
    licPaperPresented
    siren
    companyName
    companyAddress
    vehicleRegistrationNumber
    vehicleRegistrationCountry
    missionAddressBegin
    missionAddressEnd
    transportType
    articlesNature
    licenseNumber
    licenseCopyNumber
    observation
  }
`;
