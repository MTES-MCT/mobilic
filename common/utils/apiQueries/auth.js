import { gql } from "graphql-tag";

export const CREATE_OAUTH_TOKEN_MUTATION = gql`
  mutation createOauthToken($userId: Int!, $clientId: Int!) {
    createOauthToken(userId: $userId, clientId: $clientId) {
      id
      token
      clientName
      clientId
    }
  }
`;

export const REVOKE_OAUTH_TOKEN_MUTATION = gql`
  mutation revokeOauthToken($tokenId: Int!) {
    revokeOauthToken(tokenId: $tokenId) {
      clientName
      token
      id
    }
  }
`;

export const CHECK_AUTH_QUERY = gql`
  query checkAuthentication {
    checkAuth {
      success
      userId
    }
  }
`;

export const DISMISS_THIRD_PARTY_EMPLOYMENT_TOKEN_MUTATION = gql`
  mutation dismissEmploymentToken($employmentId: Int!, $clientId: Int!) {
    dismissEmploymentToken(employmentId: $employmentId, clientId: $clientId) {
      success
    }
  }
`;

export const DISMISS_THIRD_PARTY_COMPANY_TOKEN_MUTATION = gql`
  mutation dismissCompanyToken($companyId: Int!, $clientId: Int!) {
    dismissCompanyToken(companyId: $companyId, clientId: $clientId) {
      id
      name
    }
  }
`;

export const GENERATE_THIRD_PARTY_COMPANY_TOKEN_MUTATION = gql`
  mutation generateCompanyToken($companyId: Int!, $clientId: Int!) {
    generateCompanyToken(companyId: $companyId, clientId: $clientId) {
      id
      name
    }
  }
`;

export const OAUTH_CLIENT_QUERY = gql`
  query oauthClient($clientId: Int!) {
    oauthClient(clientId: $clientId) {
      id
      name
    }
  }
`;

export const THIRD_PARTY_CLIENT_EMPLOYMENT_QUERY = gql`
  query clientEmploymentLink(
    $clientId: Int!
    $employmentId: Int!
    $invitationToken: String!
  ) {
    clientEmploymentLink(
      clientId: $clientId
      employmentId: $employmentId
      invitationToken: $invitationToken
    ) {
      clientName
      employment {
        isAcknowledged
        company {
          name
        }
        user {
          email
          hasConfirmedEmail
          hasActivatedEmail
        }
      }
    }
  }
`;

export const THIRD_PARTY_CLIENT_EMPLOYMENT_ACCEPT = gql`
  mutation generateEmploymentToken(
    $clientId: Int!
    $employmentId: Int!
    $invitationToken: String!
  ) {
    generateEmploymentToken(
      clientId: $clientId
      employmentId: $employmentId
      invitationToken: $invitationToken
    ) {
      success
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

export const OAUTH_TOKEN_QUERY = gql`
  query userOAuthToken($userId: Int!) {
    oauthAccessTokens(userId: $userId) {
      id
      token
      clientName
    }
  }
`;
