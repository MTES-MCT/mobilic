import React from "react";
import { useApi } from "common/utils/api";

import { CONTROLLER_USER_CONTROLS_QUERY } from "common/utils/apiQueries";
import { useSnackbarAlerts } from "../../common/Snackbar";

export const useLoadControls = () => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [controls, setControls] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadControls = async ({
    controllerId,
    fromDate,
    toDate,
    controlsType
  }) => {
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      const result = await api.graphQlQuery(
        CONTROLLER_USER_CONTROLS_QUERY,
        {
          id: controllerId,
          fromDate,
          toDate,
          controlsType
        },

        { context: { nonPublicApi: true } }
      );
      setControls(result.data.controllerUser.controls);
      setLoading(false);
    });
  };

  return [controls, loadControls, loading];
};
