import { useState, useRef } from "react";
import { useAdminStore } from "../../store/store";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { loadActivitiesData } from "../../utils/activities";

const useLoadMoreWorkDays = ({ minDate, maxDate }) => {
  const adminStore = useAdminStore();
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [isLoadingMoreWorkDays, setIsLoadingMoreWorkDays] = useState(false);
  const isFetchingMoreWorkDaysRef = useRef(false);

  const loadMoreWorkDays = () => {
    if (
      isFetchingMoreWorkDaysRef.current ||
      !adminStore.areMissionsActivitiesLoaded ||
      !adminStore.workDaysPageInfo?.hasNextPage
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
    }).finally(() => {
      isFetchingMoreWorkDaysRef.current = false;
      setIsLoadingMoreWorkDays(false);
    });
  };

  return {
    isLoadingMoreWorkDays,
    loadMoreWorkDays,
  };
};

export default useLoadMoreWorkDays;
