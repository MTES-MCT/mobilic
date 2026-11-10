import { gql } from "graphql-tag";
import { FULL_EMPLOYMENT_FRAGMENT, FULL_TEAM_FRAGMENT } from "./apiFragments";

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
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation terminateEmployment($employmentId: Int!, $endDate: Date) {
    employments {
      terminateEmployment(employmentId: $employmentId, endDate: $endDate) {
        ...FullEmploymentData
      }
    }
  }
`;

export const BATCH_TERMINATE_EMPLOYMENTS_MUTATION = gql`
  mutation batchTerminateEmployments(
    $employments: [TerminateEmploymentInput]!
  ) {
    employments {
      batchTerminateEmployments(employments: $employments) {
        employmentId
        success
        error
      }
    }
  }
`;

export const REATTACH_EMPLOYMENT_MUTATION = gql`
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation reattachEmployment(
    $userId: Int!
    $companyId: Int!
    $isTemporary: Boolean
    $endDate: Date
  ) {
    employments {
      reattachEmployment(
        userId: $userId
        companyId: $companyId
        isTemporary: $isTemporary
        endDate: $endDate
      ) {
        employment {
          ...FullEmploymentData
        }
        emailSent
      }
    }
  }
`;

export const UPDATE_TEMPORARY_END_DATE_MUTATION = gql`
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation updateTemporaryEndDate($employmentId: Int!, $endDate: Date!) {
    employments {
      updateTemporaryEndDate(employmentId: $employmentId, endDate: $endDate) {
        ...FullEmploymentData
      }
    }
  }
`;

export const SEND_INVITATIONS_REMINDERS = gql`
  mutation sendInvitationsReminders($employmentIds: [Int]!) {
    employments {
      sendInvitationsReminders(employmentIds: $employmentIds) {
        success
        sentToEmploymentIds
      }
    }
  }
`;

export const CHANGE_EMPLOYEE_ROLE = gql`
  ${FULL_TEAM_FRAGMENT}
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation changeEmployeeRole($employmentId: Int!, $hasAdminRights: Boolean!) {
    employments {
      changeEmployeeRole(
        employmentId: $employmentId
        hasAdminRights: $hasAdminRights
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

export const CHANGE_EMPLOYEE_BUSINESS_TYPE = gql`
  ${FULL_TEAM_FRAGMENT}
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation changeEmployeeBusinessType(
    $employmentId: Int!
    $businessType: String!
    $transportType: String!
  ) {
    employments {
      changeEmployeeBusinessType(
        employmentId: $employmentId
        businessType: $businessType
        transportType: $transportType
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

export const CHANGE_EMPLOYEE_TEAM = gql`
  ${FULL_TEAM_FRAGMENT}
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation changeEmployeeTeam(
    $companyId: Int!
    $userId: Int
    $employmentId: Int
    $teamId: Int
  ) {
    employments {
      changeEmployeeTeam(
        companyId: $companyId
        userId: $userId
        employmentId: $employmentId
        teamId: $teamId
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

export const BATCH_CREATE_WORKER_EMPLOYMENTS_MUTATION = gql`
  mutation batchCreateWorkerEmployments(
    $companyId: Int!
    $mails: [Email]
    $userIds: [Int]
    $entries: [EmploymentInviteInput]
  ) {
    employments {
      batchCreateWorkerEmployments(
        companyId: $companyId
        mails: $mails
        userIds: $userIds
        entries: $entries
      ) {
        id
        startDate
        endDate
        isAcknowledged
        isTemporary
        email
        hideEmail
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
  ${FULL_EMPLOYMENT_FRAGMENT}
  mutation createEmployment(
    $userId: Int
    $companyId: Int!
    $hasAdminRights: Boolean
    $mail: Email
    $teamId: Int
    $isTemporary: Boolean
    $endDate: Date
  ) {
    employments {
      createEmployment(
        userId: $userId
        companyId: $companyId
        hasAdminRights: $hasAdminRights
        mail: $mail
        teamId: $teamId
        isTemporary: $isTemporary
        endDate: $endDate
      ) {
        ...FullEmploymentData
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
      email
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

export const UPDATE_HIDE_EMAIL_MUTATION = gql`
  mutation updateHideEmail($employmentId: Int!, $hideEmail: Boolean!) {
    employments {
      updateHideEmail(employmentId: $employmentId, hideEmail: $hideEmail) {
        id
        hideEmail
      }
    }
  }
`;

export const REQUEST_DETACHMENT_MUTATION = gql`
  mutation requestDetachment($employmentId: Int!) {
    employments {
      requestDetachment(employmentId: $employmentId) {
        id
        detachmentRequest {
          requestedAt
          lastSentAt
        }
      }
    }
  }
`;
