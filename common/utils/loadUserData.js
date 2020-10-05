import * as Sentry from "@sentry/browser";
import { USER_QUERY } from "./api";
import { broadCastChannel } from "./store";
import { parseActivityPayloadFromBackend } from "./activities";
import { parseMissionPayloadFromBackend } from "./mission";
import { DAY } from "./time";

export async function loadUserData(api, store) {
  const userId = store.userId();
  if (!userId) return;
  try {
    const userResponse = await api.graphQlQuery(USER_QUERY, {
      id: userId,
      activityAfter: Date.now() - DAY * 120
    });
    await syncUser(userResponse.data.user, store);
    await broadCastChannel.postMessage("update");
  } catch (err) {
    Sentry.captureException(err);
    console.log(err);
  }
}

export function syncUser(userPayload, store) {
  const {
    firstName,
    lastName,
    email,
    birthDate,
    hasConfirmedEmail,
    hasActivatedEmail,
    missions,
    currentEmployments,
    primaryCompany
  } = userPayload;

  const activities = [];
  const expenditures = [];
  const missionData = [];
  missions.forEach(mission => {
    activities.push(...mission.activities);
    expenditures.push(...mission.expenditures);
    missionData.push(parseMissionPayloadFromBackend(mission, store.userId()));
  });

  const syncActions = [];
  firstName &&
    lastName &&
    syncActions.push(
      store.setUserInfo({
        firstName,
        lastName,
        email,
        birthDate,
        hasConfirmedEmail,
        hasActivatedEmail
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
  primaryCompany &&
    primaryCompany.users &&
    syncActions.push(
      store.syncEntity(
        primaryCompany.users.filter(c => c.id !== userPayload.id),
        "coworkers"
      )
    );
  primaryCompany &&
    primaryCompany.vehicles &&
    syncActions.push(store.syncEntity(primaryCompany.vehicles, "vehicles"));
  currentEmployments &&
    syncActions.push(store.syncEntity(currentEmployments, "employments"));
  return Promise.all(syncActions);
}
