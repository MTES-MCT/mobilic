import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useState } from "react";
import { ADMIN_DELETED_MISSIONS_QUERY } from "common/utils/apiQueries/admin";

export const useRefreshDeletedMissions = () => {
  const api = useApi();
  const adminStore = useAdminStore();

  const [loading, setLoading] = useState(false);
  const companyId = adminStore.companyId;
  const companyIds = [companyId];
  const userId = adminStore.userId;

  const refresh = async () => {
    const companyResponse = await api.graphQlQuery(
      ADMIN_DELETED_MISSIONS_QUERY,
      {
        id: userId,
        companyIds,
        first: 200
      },
      {
        context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 },
        fetchPolicy: "cache-first"
      }
    );
    const newMissionsDeleted =
      companyResponse.data.user.adminedCompanies[0].missionsDeleted;

    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateCompanyDeletedMissions,
      payload: { companyId, missionsDeleted: newMissionsDeleted }
    });
    setLoading(false);
  };

  return {
    refresh,
    loading
  };
};
