import { useApi } from "common/utils/api";

import { HTTP_QUERIES } from "common/utils/apiQueries";

export const useDownloadBDC = controlId => {
  const api = useApi();

  const downloadBDC = async () => {
    await api.downloadFileHttpQuery(HTTP_QUERIES.controlBDCExport, {
      json: { control_id: controlId }
    });
  };

  return downloadBDC;
};
