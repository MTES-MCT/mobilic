import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useMemo, useState } from "react";
import { MINUTE, now } from "common/utils/time";
import { ADMIN_DELETED_MISSIONS_QUERY } from "common/utils/apiQueries/admin";

const CACHE_BY_COMPANY_MIN = 20;
const deletedMissionsCaches = {};

export const useRefreshDeletedMissions = () => {
  const api = useApi();
  const adminStore = useAdminStore();

  const [loading, setLoading] = useState(false);
  const companyId = adminStore.companyId;
  const companyIds = [companyId];
  const userId = adminStore.userId;

  const cacheKey = useMemo(() => `${userId}_${companyId}`, [companyId, userId]);

  const refresh = async () => {
    if (
      !deletedMissionsCaches[cacheKey] ||
      now() - deletedMissionsCaches[cacheKey].timestamp >=
        MINUTE * CACHE_BY_COMPANY_MIN
    ) {
      const companyResponse = await api.graphQlQuery(
        ADMIN_DELETED_MISSIONS_QUERY,
        {
          id: userId,
          companyIds
        },
        { context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 } }
      );
      const newMissionsDeleted =
        companyResponse.data.user.adminedCompanies[0].missionsDeleted;

      deletedMissionsCaches[cacheKey] = {
        timestamp: now(),
        data: newMissionsDeleted
      };
    }

    const missionsDeleted = deletedMissionsCaches[cacheKey].data;

    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateCompanyDeletedMissions,
      payload: { companyId, missionsDeleted }
    });
    setLoading(false);
  };

  return {
    refresh,
    loading
  };
};
