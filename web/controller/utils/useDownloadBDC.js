import { useApi } from "common/utils/api";

import { HTTP_QUERIES } from "common/utils/apiQueries";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";

export const useDownloadBDC = controlId => {
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const downloadBDC = async () => {
    try {
      await api.downloadFileHttpQuery(HTTP_QUERIES.controlBDCExport, {
        json: { control_id: controlId }
      });
    } catch (err) {
      alerts.error(formatApiError(err), "download_bdc", 6000);
    }
  };

  return downloadBDC;
};
