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
      expenditures
    } = userResponse.data.user;
    console.log(activities);
    const parsedActivities = activities.map(rawActivityPayload =>
      parseActivityPayloadFromBackend(rawActivityPayload)
    );
    storeSyncedWithLocalStorage.setUserInfo({
      firstName,
      lastName,
      companyId: company.id
    });
    storeSyncedWithLocalStorage.setCoworkers(
      company.users.concat(
        storeSyncedWithLocalStorage.coworkersPendingSubmission()
      )
    );
    storeSyncedWithLocalStorage.setActivities(
      parsedActivities.concat(
        storeSyncedWithLocalStorage.activitiesPendingSubmission()
      )
    );
    storeSyncedWithLocalStorage.setExpenditures(
      expenditures.concat(
        storeSyncedWithLocalStorage.expendituresPendingSubmission()
      )
    );
  } catch (err) {
    console.log(err);
  }
}
