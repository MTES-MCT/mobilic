import { gql } from "graphql-tag";

export const SAVE_PUSH_SUBSCRIPTION_MUTATION = gql`
  mutation savePushSubscription(
    $endpoint: String!
    $p256dh: String!
    $auth: String!
  ) {
    account {
      savePushSubscription(endpoint: $endpoint, p256dh: $p256dh, auth: $auth) {
        success
      }
    }
  }
`;
