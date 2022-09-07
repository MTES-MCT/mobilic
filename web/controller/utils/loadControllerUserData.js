import { gql } from "graphql-tag";
import { broadCastChannel } from "common/store/store";

const CONTROLLER_USER_QUERY = gql`
  query controllerUser($id: Int!) {
    controllerUser(id: $id) {
      id
      firstName
      lastName
      email
    }
  }
`;

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

async function syncControllerUser(controllerUserPayload, api, store) {
  const { id, firstName, lastName, email } = controllerUserPayload;
  const syncActions = [];
  firstName &&
    lastName &&
    syncActions.push(
      store.setControllerInfo(
        {
          id,
          firstName,
          lastName,
          email
        },
        false
      )
    );
  store.batchUpdate();
  await Promise.all(syncActions);
}
