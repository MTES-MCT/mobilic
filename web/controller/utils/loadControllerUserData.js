import { broadCastChannel } from "common/store/store";
import { CONTROLLER_USER_QUERY } from "common/utils/apiQueries";

export async function loadControllerUserData(api, store, alerts) {
  const controllerId = store.controllerId();
  if (!controllerId) return;
  await alerts.withApiErrorHandling(async () => {
    const userResponse = await api.graphQlQuery(
      CONTROLLER_USER_QUERY,
      {
        id: controllerId
      },
      { context: { nonPublicApi: true } }
    );
    await syncControllerUser(userResponse.data.controllerUser, api, store);
    await broadCastChannel.postMessage("update");
  }, "load-controller-user");
}

export async function syncControllerUser(controllerUserPayload, api, store) {
  const { id, firstName, lastName, email, grecoId } = controllerUserPayload;
  const syncActions = [];
  firstName &&
    lastName &&
    syncActions.push(
      store.setControllerInfo(
        {
          id,
          firstName,
          lastName,
          email,
          grecoId
        },
        false
      )
    );
  store.batchUpdate();
  await Promise.all(syncActions);
}
