import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useAdminStore, useAdminCompanies } from "../../store/store";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useApi } from "common/utils/api";
import { loadActivitiesData } from "../../utils/activities";
import { ADMIN_ACTIONS } from "../../store/reducers/root";
import useLoadMoreWorkDays from "./useLoadMoreWorkDays";

const withLocalLoadingScreen = (setLoading) => async (sync) => {
  setLoading(true);
  try {
    await sync();
  } finally {
    setLoading(false);
  }
};

export const useActivitiesData = () => {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();
  const [adminCompanies, company] = useAdminCompanies();
  const { users } = adminStore.activitiesFilters;

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

  const employeeFilterUserIds = users.some((u) => u.selected)
    ? users.filter((u) => u.selected).map((u) => u.id)
    : null;
  const employeeFilterKey =
    employeeFilterUserIds?.slice().sort().join(",") ?? "";

  const { isLoadingMoreWorkDays, loadMoreWorkDays } = useLoadMoreWorkDays({
    minDate,
    maxDate,
    userIds: employeeFilterUserIds,
  });

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
    if (minDate) {
      adminStore.dispatch({
        type: ADMIN_ACTIONS.updateActivitiesFilters,
        payload: { minDate },
      });
    }
  }, [minDate]);

  useEffect(() => {
    if (minDate && (!maxDate || maxDate < minDate)) {
      setMaxDate(minDate);
    } else if (maxDate && (!minDate || minDate > maxDate)) {
      setMinDate(maxDate);
    }
  }, [minDate, maxDate]);

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
      userIds: employeeFilterUserIds,
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
    prevDateRangeRef.current = { minDate, maxDate };

    const maxDateChanged = maxDate !== prevMaxDate;
    const minDateChanged = minDate !== prevMinDate;

    if (!maxDateChanged && !minDateChanged) {
      return;
    }

    if (maxDateChanged) {
      const timeoutId = setTimeout(() => {
        void refreshCurrentWorkDays();
      }, 500);
      return () => clearTimeout(timeoutId);
    }

    if (adminStore.areMissionsActivitiesLoaded) {
      const timeoutId = setTimeout(() => {
        loadMoreWorkDays(true);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [minDate, maxDate, company?.id, isDateRangeValid]);

  const prevEmployeeFilterKeyRef = useRef(employeeFilterKey);
  useEffect(() => {
    if (employeeFilterKey === prevEmployeeFilterKeyRef.current) {
      return;
    }
    prevEmployeeFilterKeyRef.current = employeeFilterKey;

    const timeoutId = setTimeout(() => {
      void refreshCurrentWorkDays();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [employeeFilterKey]);

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
    isLoadingMoreWorkDays,
    loadMoreWorkDays,
    company,
    companies,
    appliedDateRange,
  };
};
