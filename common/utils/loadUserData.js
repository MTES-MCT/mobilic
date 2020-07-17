import * as Sentry from "@sentry/browser";
import { USER_QUERY } from "./api";
import { parseActivityPayloadFromBackend } from "./activities";
import { parseMissionPayloadFromBackend } from "./mission";

export async function loadUserData(api, store) {
  const userId = store.userId();
  if (!userId) return;
  try {
    const userResponse = await api.graphQlQuery(USER_QUERY, {
      id: userId
    });
    return await syncUser(userResponse.data.user, store);
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
  }
}

export function syncUser(userPayload, store) {
  const {
    firstName,
    lastName,
    company,
    isCompanyAdmin,
    missions,
    enrollableCoworkers,
    bookableVehicles
  } = userPayload;

  const activities = [];
  const expenditures = [];
  const missionData = [];
  missions.forEach(mission => {
    activities.push(...mission.activities);
    expenditures.push(...mission.expenditures);
    missionData.push(parseMissionPayloadFromBackend(mission));
  });

  const syncActions = [];
  firstName &&
    lastName &&
    company &&
    syncActions.push(
      store.setUserInfo({
        firstName,
        lastName,
        companyId: company.id,
        companyName: company.name,
        isCompanyAdmin
      })
    );
  missions && syncActions.push(store.syncEntity(missionData, "missions"));
  activities &&
    syncActions.push(
      store.syncEntity(
        activities.map(parseActivityPayloadFromBackend),
        "activities"
      )
    );
  expenditures &&
    syncActions.push(store.syncEntity(expenditures, "expenditures"));
  enrollableCoworkers &&
    syncActions.push(store.syncEntity(enrollableCoworkers, "coworkers"));
  bookableVehicles &&
    syncActions.push(store.syncEntity(bookableVehicles, "vehicles"));
  return Promise.all(syncActions);
}
