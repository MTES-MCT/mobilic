import { useStoreSyncedWithLocalStorage } from "common/store/store";
import React from "react";
import { useSnackbarAlerts } from "./Snackbar";
import { useApi } from "common/utils/api";
import { USER_QUERY_ENOUGH_BREAK } from "common/utils/apiQueries/misc";

export const useEnoughBreak = () => {
  const store = useStoreSyncedWithLocalStorage();
  const userId = store.userId();
  const missions = store.missions();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const [hasEnoughBreak, setHasEnoughBreak] = React.useState(true);

  React.useEffect(() => {
    if (!userId) return;
    const loadData = async () => {
      await alerts.withApiErrorHandling(async () => {
        const response = await api.graphQlQuery(USER_QUERY_ENOUGH_BREAK, {
          id: userId
        });
        const { hadEnoughBreakLastMission } = response.data.user;
        setHasEnoughBreak(hadEnoughBreakLastMission);
      }, "enough-break");
    };
    loadData();
  }, [userId, missions]);

  return { hasEnoughBreak };
};
