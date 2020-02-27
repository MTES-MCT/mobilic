import { USER_QUERY } from "./api";
import { parseActivityPayloadFromBackend } from "./activities";

export async function loadUserData(api, storeSyncedWithLocalStorage) {
  try {
    const userResponse = await api.graphQlQuery(USER_QUERY, {
      id: storeSyncedWithLocalStorage.userId()
    });
    const {
      firstName,
      lastName,
      company,
      activities,
      expenditures,
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
      company.users.filter(u => u.id !== storeSyncedWithLocalStorage.userId()),
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
  } catch (err) {
    console.log(err);
  }
}
