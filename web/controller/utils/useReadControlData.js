import React from "react";
import { useApi } from "common/utils/api";

import {
  CONTROLLER_READ_CONTROL_DATA,
  CONTROLLER_READ_CONTROL_DATA_NO_LIC
} from "common/utils/apiQueries";
import { useLoadingScreen } from "common/utils/loading";
import { useSnackbarAlerts } from "../../common/Snackbar";

export const CONTROL_TYPES = {
  MOBILIC: "mobilic",
  NO_LIC: "sans_lic",
  LIC_PAPIER: "lic_papier"
};

export const useReadControlData = (controlId, controlType) => {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  const [controlData, setControlData] = React.useState({});

  React.useEffect(() => {
    if (controlId) {
      withLoadingScreen(async () => {
        await alerts.withApiErrorHandling(async () => {
          const apiResponse = await api.graphQlMutate(
            controlType === CONTROL_TYPES.MOBILIC
              ? CONTROLLER_READ_CONTROL_DATA
              : CONTROLLER_READ_CONTROL_DATA_NO_LIC,
            { controlId },
            { context: { nonPublicApi: true } }
          );
          setControlData(apiResponse.data.controlData);
        });
      });
    }
  }, [controlId]);

  return [controlData, setControlData];
};
