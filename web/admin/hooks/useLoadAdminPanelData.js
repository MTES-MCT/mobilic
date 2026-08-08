import React from "react";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { useAdminStore } from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { loadActivitiesData } from "../utils/activities";
import { loadEmploymentsData } from "../utils/employments";
import { loadTeamsData } from "../utils/teams";

// Loads the activities/employments/teams data needed by the admin panels
export const useLoadAdminPanelData = () => {
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();

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

  React.useEffect(() => {
    if (adminStore.companyId && !adminStore.areEmploymentsLoaded) {
      loadEmploymentsData({ adminStore, alerts, api, withLoadingScreen });
    }
  }, [adminStore.companyId]);

  React.useEffect(() => {
    if (adminStore.companyId && !adminStore.areTeamsLoaded) {
      loadTeamsData({ adminStore, alerts, api, withLoadingScreen });
    }
  }, [adminStore.companyId]);
};
