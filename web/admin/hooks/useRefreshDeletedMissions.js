import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useCallback, useRef, useState } from "react";
import { ADMIN_DELETED_MISSIONS_QUERY } from "common/utils/apiQueries/admin";
import { getEndOfDay, startOfDay } from "common/utils/time";

export const useRefreshDeletedMissions = () => {
  const api = useApi();
  const adminStore = useAdminStore();

  const [loading, setLoading] = useState(false);
  const companyId = adminStore.companyId;
  const userId = adminStore.userId;

  const dispatchRef = useRef(adminStore.dispatch);
  dispatchRef.current = adminStore.dispatch;

  const refresh = useCallback(
    async (minDate, maxDate) => {
      setLoading(true);
      const fromTime = minDate ? startOfDay(new Date(minDate)) : null;
      const untilTime = maxDate
        ? getEndOfDay(startOfDay(new Date(maxDate)))
        : null;
      const companyResponse = await api.graphQlQuery(
        ADMIN_DELETED_MISSIONS_QUERY,
        {
          id: userId,
          companyIds: [companyId],
          first: 200,
          fromTime,
          untilTime
        },
        {
          context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 },
          fetchPolicy: "cache-first"
        }
      );
      const newMissionsDeleted =
        companyResponse.data.user.adminedCompanies[0].missionsDeleted;

      dispatchRef.current({
        type: ADMIN_ACTIONS.updateCompanyDeletedMissions,
        payload: { companyId, missionsDeleted: newMissionsDeleted }
      });
      setLoading(false);
    },
    [api, userId, companyId]
  );

  return {
    refresh,
    loading
  };
};
