import { gql } from "graphql-tag";
import { COMPANY_SETTINGS_FRAGMENT } from "./apiFragments";

export const LOGIN_MUTATION_STRING = `mutation login($email: Email!, $password: String!) {
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
    $email: Email!
    $password: Password!
    $firstName: String!
    $lastName: String!
    $gender: GenderEnum
    $inviteToken: String
    $subscribeToNewsletter: Boolean
    $isEmployee: Boolean
    $timezoneName: String
    $wayHeardOfMobilic: String
    $phoneNumber: String
    $acceptCgu: Boolean
  ) {
    signUp {
      user(
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
        gender: $gender
        inviteToken: $inviteToken
        subscribeToNewsletter: $subscribeToNewsletter
        isEmployee: $isEmployee
        timezoneName: $timezoneName
        wayHeardOfMobilic: $wayHeardOfMobilic
        phoneNumber: $phoneNumber
        acceptCgu: $acceptCgu
      ) {
        accessToken
        refreshToken
      }
    }
  }
`;
export const CONFIRM_FC_EMAIL_MUTATION = gql`
  mutation confirmFcEmail(
    $email: Email!
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
  mutation companySignUp(
    $siren: String!
    $usualName: String!
    $phoneNumber: String
    $businessType: String
    $nbWorkers: Int
  ) {
    signUp {
      company(
        siren: $siren
        usualName: $usualName
        phoneNumber: $phoneNumber
        businessType: $businessType
        nbWorkers: $nbWorkers
      ) {
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

export const RESEND_ACTIVATION_EMAIL = gql`
  mutation resendActivationEmail($email: Email!) {
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
  mutation requestResetPassword($mail: Email!) {
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
