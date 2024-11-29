import React from "react";
import { useApi } from "common/utils/api";

import {
  CONTROLLER_READ_CONTROL_DATA,
  CONTROLLER_READ_CONTROL_DATA_NO_LIC
} from "common/utils/apiQueries";
import { useLoadingScreen } from "common/utils/loading";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { canDownloadBDC as _canDownloadBDC } from "./controlBulletin";

// Value AND label must match ControlType enum from API
export const CONTROL_TYPES = {
  MOBILIC: { value: "mobilic", label: "Mobilic" },
  NO_LIC: { value: "sans_lic", label: "Pas de LIC" },
  LIC_PAPIER: { value: "lic_papier", label: "LIC papier" }
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
            controlType === CONTROL_TYPES.MOBILIC.label
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

  const canDownloadBDC = React.useMemo(() => _canDownloadBDC(controlData), [
    controlData
  ]);

  const bdcAlreadyExists = React.useMemo(
    () => !!controlData?.controlBulletinCreationTime,
    [controlData]
  );

  return {
    controlData,
    setControlData,
    controlId,
    controlType,
    canDownloadBDC,
    bdcAlreadyExists
  };
};
