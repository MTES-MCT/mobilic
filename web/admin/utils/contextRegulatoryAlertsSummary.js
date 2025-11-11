import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState
} from "react";

import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { ADMIN_COMPANY_REGULATORY_ALERTS_SUMMARY_QUERY } from "common/utils/apiQueries";

function useRegulatoryAlertsSummary() {
  const api = useApi();
  const adminStore = useAdminStore();

  const adminId = adminStore.userId;
  const companyId = adminStore.companyId;

  const [date, setDate] = useState(new Date());
  const [teamId, setTeamId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => console.log("userId", userId), [userId]);

  const queryData = useCallback(async () => {
    const res = await api.graphQlQuery(
      ADMIN_COMPANY_REGULATORY_ALERTS_SUMMARY_QUERY,
      {
        id: adminId,
        companyIds: [companyId],
        month: date.toISOString().slice(0, 7),
        uniqueUserId: userId,
        teamId: !userId ? teamId : null
      }
    );
    const summary = res.data.user.adminedCompanies[0].regulatoryAlertsRecap;
    setSummary(summary);
  }, [adminId, companyId, date, userId, teamId]);

  useEffect(() => {
    if (!adminId || !companyId) {
      return;
    }
    queryData();
  }, [date, adminId, companyId, userId, teamId]);

  return {
    date,
    setDate,
    summary,
    onSelectUniqueUserId: setUserId,
    onSelectTeamId: setTeamId,
    uniqueUserId: userId
  };
}

const RegulatoryAlertsSummaryContext = createContext(null);

export const useRegulatoryAlertsSummaryContext = () =>
  useContext(RegulatoryAlertsSummaryContext);

export function RegulatoryAlertsSummaryProvider({ children }) {
  return (
    <RegulatoryAlertsSummaryContext.Provider
      value={{ ...useRegulatoryAlertsSummary() }}
    >
      {children}
    </RegulatoryAlertsSummaryContext.Provider>
  );
}
