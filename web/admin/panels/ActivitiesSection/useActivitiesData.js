import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAdminStore, useAdminCompanies } from "../../store/store";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useApi } from "common/utils/api";
import { loadActivitiesData } from "../../utils/activities";
import { ADMIN_ACTIONS } from "../../store/reducers/root";
import debounce from "lodash/debounce";

const withLocalLoadingScreen = (setLoading) => async (sync) => {
  setLoading(true);
  try {
    await sync();
  } finally {
    setLoading(false);
  }
};

const onMinDateChange = debounce(
  async ({ newMinDate, maxDate, adminStore, api, alerts, setLoading }) => {
    if (newMinDate < maxDate) {
      await loadActivitiesData({
        adminStore,
        alerts,
        api,
        withLoadingScreen: withLocalLoadingScreen(setLoading),
        minDate: newMinDate,
        maxDate,
        reset: false,
      });
    }
  },
  500,
);

export const useActivitiesData = () => {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();
  const [adminCompanies, company] = useAdminCompanies();

  const [minDate, setMinDate] = useState(adminStore.activitiesFilters.minDate);
  const [maxDate, setMaxDate] = useState(adminStore.activitiesFilters.maxDate);
  const [dateRangeError, setDateRangeError] = useState("");
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const lastValidDateRangeRef = useRef({
    minDate: adminStore.activitiesFilters.minDate,
    maxDate: adminStore.activitiesFilters.maxDate,
  });
  const minDateOfFetchedData = adminStore.minWorkDaysDate;

  const isDateRangeValid = useCallback((start, end) => {
    if (!start || !end || start > end) {
      return false;
    }

    const daysDiff = Math.ceil(
      (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24),
    );
    return daysDiff <= 365;
  }, []);

  useEffect(() => {
    setMinDate(adminStore.activitiesFilters.minDate);
  }, [adminStore.activitiesFilters.minDate]);

  useEffect(() => {
    if (maxDate && !minDate) setMinDate(minDateOfFetchedData);
    if (maxDate && minDate && minDate > maxDate) setMinDate(maxDate);
    if (!isDateRangeValid(minDate, maxDate)) {
      return;
    }
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { maxDate },
    });
  }, [maxDate, minDate, isDateRangeValid]);

  useEffect(() => {
    if (adminCompanies) {
      const newCompaniesWithCurrentSelectionStatus = adminCompanies.map(
        (c) => ({
          ...c,
          selected: c.id === adminStore.companyId,
        }),
      );
      setCompanies(newCompaniesWithCurrentSelectionStatus);
    }
  }, [adminCompanies]);

  useEffect(() => {
    if (minDate && (!maxDate || maxDate < minDate)) setMaxDate(minDate);
    if (!isDateRangeValid(minDate, maxDate)) {
      return;
    }

    onMinDateChange({
      newMinDate: minDate,
      maxDate: minDateOfFetchedData,
      adminStore,
      api,
      alerts,
      setLoading,
    });
    adminStore.dispatch({
      type: ADMIN_ACTIONS.updateActivitiesFilters,
      payload: { minDate },
    });
  }, [minDate, maxDate, isDateRangeValid]);

  useEffect(() => {
    if (minDate && maxDate && !isDateRangeValid(minDate, maxDate)) {
      setDateRangeError("La période ne peut pas dépasser 1 an");
    } else {
      setDateRangeError("");
    }
  }, [minDate, maxDate, isDateRangeValid]);

  const refreshCurrentWorkDays = () =>
    loadActivitiesData({
      adminStore,
      alerts,
      api,
      withLoadingScreen: withLocalLoadingScreen(setLoading),
      minDate,
      maxDate,
      reset: true,
    });

  const prevDateRangeRef = useRef({ minDate, maxDate });
  useEffect(() => {
    if (!minDate || !maxDate || !company?.id) return;

    if (!isDateRangeValid(minDate, maxDate)) {
      return;
    }

    lastValidDateRangeRef.current = { minDate, maxDate };

    const prevMinDate = prevDateRangeRef.current.minDate;
    const prevMaxDate = prevDateRangeRef.current.maxDate;

    const shouldReload = maxDate !== prevMaxDate || minDate > prevMinDate;

    if (shouldReload) {
      const timeoutId = setTimeout(() => {
        refreshCurrentWorkDays().catch((err) => console.error(err));
      }, 500);

      prevDateRangeRef.current = { minDate, maxDate };
      return () => clearTimeout(timeoutId);
    }

    prevDateRangeRef.current = { minDate, maxDate };
  }, [
    minDate,
    maxDate,
    company?.id,
    isDateRangeValid,
    alerts,
    api,
    adminStore,
    company,
  ]);

  const appliedDateRange = useMemo(() => {
    if (isDateRangeValid(minDate, maxDate)) {
      return { minDate, maxDate };
    }

    return lastValidDateRangeRef.current;
  }, [minDate, maxDate, isDateRangeValid]);

  return {
    minDate,
    setMinDate,
    maxDate,
    setMaxDate,
    dateRangeError,
    loading,
    refreshCurrentWorkDays,
    company,
    companies,
    appliedDateRange,
  };
};
