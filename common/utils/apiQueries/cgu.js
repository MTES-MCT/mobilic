import { gql } from "graphql-tag";
import { USER_AGREEMENT } from "./apiFragments";

export const ACCEPT_CGU_MUTATION = gql`
  ${USER_AGREEMENT}
  mutation acceptCgu($userId: Int!, $cguVersion: String!) {
    account {
      acceptCgu(userId: $userId, cguVersion: $cguVersion) {
        ...UserAgreementData
      }
    }
  }
`;

export const REJECT_CGU_MUTATION = gql`
  ${USER_AGREEMENT}
  mutation rejectCgu($userId: Int!, $cguVersion: String!) {
    account {
      rejectCgu(userId: $userId, cguVersion: $cguVersion) {
        ...UserAgreementData
      }
    }
  }
`;
