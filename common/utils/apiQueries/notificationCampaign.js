import { gql } from "graphql-tag";

export const CAMPAIGN_FIELDS = `
  id
  creationTime
  title
  body
  targetType
  status
  targetedCount
  totalRecipients
  sentCount
  failedCount
  clickedCount
  scheduledAt
  completedAt
  targetUsers
`;

export const CREATE_NOTIFICATION_CAMPAIGN_MUTATION = gql`
  mutation createNotificationCampaign(
    $title: String!
    $body: String!
    $targetType: CampaignTargetTypeEnum!
    $targetUserIds: [Int]
    $scheduledAt: TimeStamp
  ) {
    notificationCampaigns {
      createNotificationCampaign(
        title: $title
        body: $body
        targetType: $targetType
        targetUserIds: $targetUserIds
        scheduledAt: $scheduledAt
      ) {
        ${CAMPAIGN_FIELDS}
      }
    }
  }
`;

export const CANCEL_NOTIFICATION_CAMPAIGN_MUTATION = gql`
  mutation cancelNotificationCampaign($campaignId: Int!) {
    notificationCampaigns {
      cancelNotificationCampaign(campaignId: $campaignId) {
        ${CAMPAIGN_FIELDS}
      }
    }
  }
`;

export const NOTIFICATION_CAMPAIGNS_QUERY = gql`
  query notificationCampaigns($offset: Int, $limit: Int) {
    notificationCampaigns(offset: $offset, limit: $limit) {
      results {
        ${CAMPAIGN_FIELDS}
      }
      hasMore
    }
  }
`;

export const UPDATE_PUSH_BANNER_TEXT_MUTATION = gql`
  mutation updatePushBannerText($bannerText: String!) {
    notificationCampaigns {
      updatePushBannerText(bannerText: $bannerText) {
        success
      }
    }
  }
`;

export const SEARCH_USERS_FOR_CAMPAIGN_QUERY = gql`
  query searchUsersForCampaign(
    $search: String!
    $targetType: CampaignTargetTypeEnum
    $offset: Int
  ) {
    searchUsersForCampaign(
      search: $search
      targetType: $targetType
      offset: $offset
    ) {
      results {
        id
        email
        firstName
        lastName
      }
      hasMore
    }
  }
`;
