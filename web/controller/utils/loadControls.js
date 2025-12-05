import React from "react";
import { useApi } from "common/utils/api";

import { useSnackbarAlerts } from "../../common/Snackbar";
import { isoFormatLocalDate } from "common/utils/time";
import { CONTROLLER_USER_CONTROLS_QUERY } from "common/utils/apiQueries/controller";

export const useLoadControls = () => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [controls, setControls] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const loadControls = async ({
    controllerId,
    fromDate,
    toDate,
    limit,
    controlsType
  }) => {
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      const result = await api.graphQlQuery(
        CONTROLLER_USER_CONTROLS_QUERY,
        {
          id: controllerId,
          fromDate: fromDate ? isoFormatLocalDate(fromDate) : null,
          toDate: toDate ? isoFormatLocalDate(toDate) : null,
          limit,
          ...(controlsType && { controlsType })
        },

        { context: { nonPublicApi: true } }
      );
      setControls(result.data.controllerUser.controls);
      setLoading(false);
    });
  };

  return [controls, loadControls, loading];
};
