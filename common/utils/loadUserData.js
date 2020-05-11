import { USER_QUERY } from "./api";
import { parseActivityPayloadFromBackend } from "./activities";

export async function loadUserData(api, store) {
  const userId = store.userId();
  if (!userId) return;
  try {
    const userResponse = await api.graphQlQuery(USER_QUERY, {
      id: userId
    });
    return await syncUser(userResponse.data.user, store);
  } catch (err) {
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
  const comments = [];
  const vehicleBookings = [];
  const missionData = [];
  missions.forEach(mission => {
    activities.push(...mission.activities);
    comments.push(...mission.comments);
    vehicleBookings.push(...mission.vehicleBookings);
    missionData.push({id: mission.id, name: mission.name, eventTime: mission.eventTime, validated: mission.validated})
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
  activities &&
    syncActions.push(
      store.syncAllSubmittedItems(
        activities.map(parseActivityPayloadFromBackend),
        "activities"
      )
    );
  enrollableCoworkers &&
    syncActions.push(
      store.syncAllSubmittedItems(enrollableCoworkers, "coworkers")
    );
  comments && syncActions.push(store.syncAllSubmittedItems(comments, "comments"));
  missions && syncActions.push(store.syncAllSubmittedItems(missionData, "missions"));
  vehicleBookings &&
    syncActions.push(
      store.syncAllSubmittedItems(vehicleBookings, "vehicleBookings")
    );
  bookableVehicles &&
    syncActions.push(store.syncAllSubmittedItems(bookableVehicles, "vehicles"));
  return Promise.all(syncActions);
}
