import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { ADD_SCENARIO_TESTING_RESULT } from "common/utils/apiQueries";

export const SCENARIOS = {
  SCENARIO_A: "Certificate banner",
  SCENARIO_B: "Certificate badge"
};

const getScenario = userId =>
  userId % 2 === 0 ? SCENARIOS.SCENARIO_A : SCENARIOS.SCENARIO_B;

export const ACTIONS = {
  LOAD: "Load",
  SUCCESS: "Success",
  CLOSE: "Close"
};

export function useSendScenarioTestingResult() {
  const api = useApi();
  const adminStore = useAdminStore();

  const sendResult = result => async () => {
    await api.graphQlMutate(
      ADD_SCENARIO_TESTING_RESULT,
      {
        userId: adminStore.userId,
        action: result,
        scenario: getScenario(adminStore.userId)
      },
      { context: { nonPublicApi: true } }
    );
  };

  const sendSuccess = () => sendResult(ACTIONS.SUCCESS)();
  const sendClose = () => sendResult(ACTIONS.CLOSE)();
  const sendLoad = () => sendResult(ACTIONS.LOAD)();

  return [sendSuccess, sendClose, sendLoad];
}
