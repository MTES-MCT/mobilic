import React from "react";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { useAdminStore } from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { loadTeamsData } from "../utils/teams";

export const useEnsureTeams = () => {
    const adminStore = useAdminStore();
    const alerts = useSnackbarAlerts();
    const api = useApi();
    const withLoadingScreen = useLoadingScreen();

    React.useEffect(() => {
    if (adminStore.companyId && !adminStore.areTeamsLoaded) {
        loadTeamsData({ adminStore, alerts, api, withLoadingScreen });
    }
    }, [adminStore.companyId]);
}
