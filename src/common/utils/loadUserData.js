import { USER_QUERY } from "./api";
import { parseActivityPayloadFromBackend } from "./activities";

export async function loadUserData(api, storeSyncedWithLocalStorage) {
  const userId = storeSyncedWithLocalStorage.userId();
  if (!userId) return;
  try {
    const userResponse = await api.graphQlQuery(USER_QUERY, {
      id: userId
    });
    const {
      firstName,
      lastName,
      company,
      activities,
      expenditures,
      teamEnrollments,
      enrollableCoworkers,
      comments
    } = userResponse.data.user;
    const parsedActivities = activities.map(rawActivityPayload =>
      parseActivityPayloadFromBackend(rawActivityPayload)
    );
    storeSyncedWithLocalStorage.setUserInfo({
      firstName,
      lastName,
      companyId: company.id,
      companyName: company.name
    });
    storeSyncedWithLocalStorage.updateAllSubmittedEvents(
      enrollableCoworkers,
      "coworkers"
    );
    storeSyncedWithLocalStorage.updateAllSubmittedEvents(
      parsedActivities,
      "activities"
    );
    storeSyncedWithLocalStorage.updateAllSubmittedEvents(
      expenditures,
      "expenditures"
    );
    storeSyncedWithLocalStorage.updateAllSubmittedEvents(comments, "comments");
    storeSyncedWithLocalStorage.updateAllSubmittedEvents(
      teamEnrollments,
      "teamEnrollments"
    );
  } catch (err) {
    console.log(err);
  }
}
