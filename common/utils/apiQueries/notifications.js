import { gql } from "graphql-tag";
import { NOTIFICATION_FRAGMENT } from "./apiFragments";

export const READ_NOTIFICATIONS_MUTATION = gql`
  ${NOTIFICATION_FRAGMENT}
  mutation markNotificationsAsRead($notificationIds: [Int!]!) {
    account {
      markNotificationsAsRead(notificationIds: $notificationIds) {
        ...NotificationData
      }
    }
  }
`;

export const NOTIFICATIONS_QUERY = gql`
  ${NOTIFICATION_FRAGMENT}
  query GetUserNotifications($id: Int!) {
    user(id: $id) {
      notifications {
        ...NotificationData
      }
    }
  }
`;
