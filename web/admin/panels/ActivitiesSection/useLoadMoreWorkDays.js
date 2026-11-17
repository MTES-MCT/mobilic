import { useState, useRef } from "react";
import { useAdminStore } from "../../store/store";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { loadActivitiesData } from "../../utils/activities";

const useLoadMoreWorkDays = ({ minDate, maxDate, userIds }) => {
  const adminStore = useAdminStore();
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [isLoadingMoreWorkDays, setIsLoadingMoreWorkDays] = useState(false);
  const isFetchingMoreWorkDaysRef = useRef(false);

  const loadMoreWorkDays = (force = false) => {
    if (
      isFetchingMoreWorkDaysRef.current ||
      !adminStore.areMissionsActivitiesLoaded ||
      (!force && !adminStore.workDaysPageInfo?.hasNextPage)
    ) {
      return;
    }
    isFetchingMoreWorkDaysRef.current = true;
    setIsLoadingMoreWorkDays(true);
    loadActivitiesData({
      adminStore,
      alerts,
      api,
      withLoadingScreen: async (sync) => await sync(),
      minDate,
      maxDate,
      reset: false,
      userIds,
    })
      .finally(() => {
        isFetchingMoreWorkDaysRef.current = false;
        setIsLoadingMoreWorkDays(false);
      })
      .catch((err) => console.error(err));
  };

  return {
    isLoadingMoreWorkDays,
    loadMoreWorkDays,
  };
};

export default useLoadMoreWorkDays;
