import { gql } from "@apollo/client";

export const SEARCH_USERS_FOR_IMPERSONATION = gql`
  query SearchUsersForImpersonation($search: String!, $offset: Int) {
    searchUsersForImpersonation(search: $search, offset: $offset) {
      results {
        id
        email
        firstName
        lastName
        companies {
          name
          siren
        }
      }
      hasMore
    }
  }
`;

export const START_IMPERSONATION_MUTATION = gql`
  mutation StartImpersonation($userId: Int!) {
    account {
      startImpersonation(userId: $userId) {
        accessToken
        impersonatedUserId
      }
    }
  }
`;

export const STOP_IMPERSONATION_MUTATION = gql`
  mutation StopImpersonation {
    account {
      stopImpersonation {
        success
      }
    }
  }
`;
