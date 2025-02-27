import React from "react";
import { useApi } from "common/utils/api";

import {
  CONTROLLER_READ_CONTROL_DATA,
  CONTROLLER_READ_CONTROL_DATA_NO_LIC,
  HTTP_QUERIES
} from "common/utils/apiQueries";
import { useLoadingScreen } from "common/utils/loading";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { canDownloadBDC as _canDownloadBDC } from "./controlBulletin";
import { strToUnixTimestamp } from "common/utils/time";

// Value AND label must match ControlType enum from API
export const CONTROL_TYPES = {
  MOBILIC: { value: "mobilic", label: "Mobilic" },
  LIC_PAPIER: { value: "lic_papier", label: "LIC papier" },
  NO_LIC: { value: "sans_lic", label: "Pas de LIC" }
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
          const controlData = apiResponse.data.controlData;
          setControlData({
            ...controlData,
            observedInfractions: controlData.observedInfractions.map(
              infraction => ({
                ...infraction,
                date: infraction.date
                  ? strToUnixTimestamp(infraction.date)
                  : null
              })
            )
          });
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

  const uploadPictures = pictures => {
    alerts.withApiErrorHandling(async () => {
      const presignedUrlsRes = await api.jsonHttpQuery(
        HTTP_QUERIES.controlPicturesGeneratePresignedUrls,
        {
          json: { control_id: controlId, nb_pictures: pictures.length }
        }
      );
      const presignedUrls = presignedUrlsRes["presigned-urls"];

      pictures.forEach(async (picture, index) => {
        const uploadRes = await fetch(presignedUrls[index], {
          method: "PUT",
          headers: { "Content-Type": "image/png" },
          body: picture.file
        });
        // TODO: check status is 200
        console.log("uploadRes", uploadRes);
      });
    }, "download-control-c1b-one");
  };

  return {
    controlData,
    setControlData,
    controlId,
    controlType,
    canDownloadBDC,
    bdcAlreadyExists,
    uploadPictures
  };
};
