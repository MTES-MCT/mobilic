import { gql } from "graphql-tag";
import { FULL_EMPLOYMENT_FRAGMENT, FULL_TEAM_FRAGMENT } from "./apiFragments";

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
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation deleteTeam($teamId: Int!) {
    teams {
      deleteTeam(teamId: $teamId) {
        teams {
          ...FullTeamData
        }
        employments(latestPerUser: true) {
          ...FullEmploymentData
        }
      }
    }
  }
`;

export const CREATE_TEAM_MUTATION = gql`
  ${FULL_EMPLOYMENT_FRAGMENT}
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
        employments(latestPerUser: true) {
          ...FullEmploymentData
        }
      }
    }
  }
`;

export const UPDATE_TEAM_MUTATION = gql`
  ${FULL_TEAM_FRAGMENT}
  ${FULL_EMPLOYMENT_FRAGMENT}
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
        employments(latestPerUser: true) {
          ...FullEmploymentData
        }
      }
    }
  }
`;
