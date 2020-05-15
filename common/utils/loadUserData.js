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
  const teamChanges = [];
  const missionData = [];
  missions.forEach(mission => {
    activities.push(...mission.activities);
    comments.push(...mission.comments);
    vehicleBookings.push(...mission.vehicleBookings);
    teamChanges.push(...(mission.teamChanges || []));
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
  enrollableCoworkers &&
    syncActions.push(store.syncEntity(enrollableCoworkers, "coworkers"));
  comments && syncActions.push(store.syncEntity(comments, "comments"));
  teamChanges && syncActions.push(store.syncEntity(teamChanges, "teamChanges"));
  vehicleBookings &&
    syncActions.push(store.syncEntity(vehicleBookings, "vehicleBookings"));
  bookableVehicles &&
    syncActions.push(store.syncEntity(bookableVehicles, "vehicles"));
  return Promise.all(syncActions);
}
