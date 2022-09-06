import { useApi } from "common/utils/api";
import { isoFormatLocalDate } from "common/utils/time";

import { CONTROLLER_USER_CONTROLS_QUERY } from "common/utils/apiQueries";

export const useLoadControls = () => {
  const api = useApi();

  return async ({ controllerId, fromDate }) => {
    const res = await api.graphQlQuery(
      CONTROLLER_USER_CONTROLS_QUERY,
      {
        id: controllerId,
        fromDate: isoFormatLocalDate(fromDate)
      },

      { context: { nonPublicApi: true } }
    );
    return res.data.controllerUser.controls;
  };
};
