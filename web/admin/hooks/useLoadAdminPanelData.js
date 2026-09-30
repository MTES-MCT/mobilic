import React from "react";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { useAdminStore } from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { loadActivitiesData } from "../utils/activities";
import { useEnsureEmployments } from "./useEnsureEmployments";
import { useEnsureTeams } from "./useEnsureTeams";

// Loads the activities/employments/teams data needed by the admin panels
export const useLoadAdminPanelData = () => {
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

  useEnsureEmployments();
  useEnsureTeams();

  React.useEffect(() => {
    async function loadActivities() {
      await loadActivitiesData({
        adminStore,
        alerts,
        api,
        withLoadingScreen
      });
    }
    if (adminStore.companyId && !adminStore.areMissionsActivitiesLoaded) {
      loadActivities();
    }
  }, [adminStore.companyId]);
};
