import { USER_QUERY } from "./api";
import { parseActivityPayloadFromBackend } from "./activities";

export async function loadUserData(api, storeSyncedWithLocalStorage) {
  const userId = storeSyncedWithLocalStorage.userId();
  if (!userId) return;
  try {
    const userResponse = await api.graphQlQuery(USER_QUERY, {
      id: userId
    });
    return await syncUser(userResponse.data.user, storeSyncedWithLocalStorage);
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
    activities,
    expenditures,
    teamEnrollments,
    enrollableCoworkers,
    comments,
    missions,
    vehicleBookings,
    bookableVehicles
  } = userPayload;
  const syncs = [];
  firstName &&
    lastName &&
    company &&
    syncs.push(
      store.setUserInfo({
        firstName,
        lastName,
        companyId: company.id,
        companyName: company.name,
        isCompanyAdmin
      })
    );
  activities &&
    syncs.push(
      store.updateAllSubmittedEvents(
        activities.map(parseActivityPayloadFromBackend),
        "activities"
      )
    );
  expenditures &&
    syncs.push(store.updateAllSubmittedEvents(expenditures, "expenditures"));
  teamEnrollments &&
    syncs.push(
      store.updateAllSubmittedEvents(teamEnrollments, "teamEnrollments")
    );
  enrollableCoworkers &&
    syncs.push(
      store.updateAllSubmittedEvents(enrollableCoworkers, "coworkers")
    );
  comments && syncs.push(store.updateAllSubmittedEvents(comments, "comments"));
  missions && syncs.push(store.updateAllSubmittedEvents(missions, "missions"));
  vehicleBookings &&
    syncs.push(
      store.updateAllSubmittedEvents(vehicleBookings, "vehicleBookings")
    );
  bookableVehicles &&
    syncs.push(store.updateAllSubmittedEvents(bookableVehicles, "vehicles"));
  return Promise.all(syncs);
}
