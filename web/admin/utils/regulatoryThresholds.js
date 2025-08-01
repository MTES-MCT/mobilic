import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { USER_READ_REGULATION_COMPUTATIONS_QUERY } from "common/utils/apiQueries";
import {
  getThresholdConfig,
  formatEmployeeName
} from "../panels/CertificationPanel/regulatoryThresholdConstants";
import { useAdminStore } from "../store/store";

/**
 * useRegulatoryThresholds - DSFR v1.26 Compatible Hook
 * State management for regulatory thresholds data and filtering
 * Integrates with existing GraphQL infrastructure
 */
export function useRegulatoryThresholds(companyId) {
  const api = useApi();
  const adminStore = useAdminStore();

  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });

  const [regulatoryData, setRegulatoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const employees = useMemo(
    () => adminStore.users?.filter(u => u.companyId === companyId) || [],
    [adminStore.users, companyId]
  );

  /**
   * Fetch regulatory computations data
   * Uses existing GraphQL query infrastructure
   */
  const fetchRegulatoryData = useCallback(async () => {
    if (!companyId || loading) return;

    setLoading(true);
    setError(null);

    try {
      if (!employees || employees.length === 0) {
        setRegulatoryData(null);
        setLoading(false);
        return;
      }

      const targetEmployees =
        selectedEmployee === "all"
          ? employees
          : employees.filter(emp => emp.id.toString() === selectedEmployee);

      if (targetEmployees.length === 0) {
        setRegulatoryData(null);
        setLoading(false);
        return;
      }

      const regulatoryPromises = targetEmployees.map(employee =>
        api.graphQlQuery(USER_READ_REGULATION_COMPUTATIONS_QUERY, {
          userId: employee.id,
          fromDate: dateRange.start?.toISOString().split("T")[0],
          toDate: dateRange.end?.toISOString().split("T")[0]
        })
      );

      const results = await Promise.all(regulatoryPromises);

      const aggregatedData = aggregateRegulatoryResults(
        results,
        targetEmployees
      );
      setRegulatoryData(aggregatedData);
    } catch (err) {
      setError(formatApiError(err));
      setRegulatoryData(null);
    } finally {
      setLoading(false);
    }
  }, [
    api,
    companyId,
    selectedEmployee,
    dateRange.start,
    dateRange.end,
    employees
  ]);

  useEffect(() => {
    fetchRegulatoryData();
  }, [fetchRegulatoryData]);

  /**
   * Calculated thresholds with compliance status
   * Processes raw regulatory data into display-ready format
   */
  const calculatedThresholds = useMemo(() => {
    if (!regulatoryData) return null;

    return {
      daily: processCategoryThresholds("daily", regulatoryData),
      weekly: processCategoryThresholds("weekly", regulatoryData),
      summary: calculateOverallSummary(regulatoryData)
    };
  }, [regulatoryData]);

  const handleEmployeeChange = useCallback(employeeId => {
    setSelectedEmployee(employeeId);
  }, []);

  const handleDateRangeChange = useCallback(newDateRange => {
    setDateRange(newDateRange);
  }, []);

  /**
   * Refresh data manually
   */
  const refreshData = useCallback(() => {
    fetchRegulatoryData();
  }, [fetchRegulatoryData]);

  return {
    selectedEmployee,
    setSelectedEmployee: handleEmployeeChange,
    dateRange,
    setDateRange: handleDateRangeChange,

    calculatedThresholds,
    rawRegulatoryData: regulatoryData,
    employees,

    loading,
    error,
    refreshData,

    hasData: regulatoryData && regulatoryData.regulationComputations?.length > 0
  };
}

/**
 * Aggregate regulatory results from multiple employees
 */
function aggregateRegulatoryResults(results, employees) {
  if (!results || results.length === 0) return null;

  const aggregatedComputations = [];

  results.forEach((result, index) => {
    if (result.data?.user?.regulationComputationsByDay) {
      const employeeData = result.data.user.regulationComputationsByDay;

      employeeData.forEach(dayData => {
        let existingDay = aggregatedComputations.find(
          comp => comp.day === dayData.day
        );

        if (!existingDay) {
          existingDay = {
            day: dayData.day,
            regulationComputations: []
          };
          aggregatedComputations.push(existingDay);
        }

        if (dayData.regulationComputations) {
          dayData.regulationComputations.forEach(computation => {
            if (computation.regulationChecks) {
              computation.regulationChecks.forEach(check => {
                existingDay.regulationComputations.push({
                  regulationCheck: {
                    type: check.type,
                    label: check.label,
                    unit: check.unit
                  },
                  success: !check.alert,
                  extra: check.alert?.extra || {},
                  employeeId: employees[index]?.id,
                  employeeName: formatEmployeeName(employees[index])
                });
              });
            }
          });
        }
      });
    }
  });

  return {
    regulationComputations: aggregatedComputations,
    employeeCount: employees.length,
    aggregationType: employees.length > 1 ? "multiple" : "single"
  };
}

/**
 * Process thresholds for a specific category (daily/weekly)
 */
function processCategoryThresholds(category, regulatoryData) {
  if (!regulatoryData?.regulationComputations) return [];

  const categoryThresholds = ["daily", "weekly"].includes(category)
    ? category === "daily"
      ? [
          "minimumDailyRest",
          "maximumWorkDayTime",
          "enoughBreak",
          "maximumUninterruptedWorkTime"
        ]
      : ["maximumWorkedDaysInWeek", "maximumWorkInCalendarWeek"]
    : [];

  return categoryThresholds
    .map(thresholdType => {
      const thresholdConfig = getThresholdConfig(thresholdType);
      if (!thresholdConfig) return null;

      const matchingComputation = findMostRecentComputation(
        regulatoryData.regulationComputations,
        thresholdType
      );

      return {
        thresholdType,
        config: thresholdConfig,
        isCompliant: matchingComputation ? matchingComputation.success : false,
        data: matchingComputation,
        lastChecked: matchingComputation?.day
      };
    })
    .filter(Boolean);
}

/**
 * Find the most recent regulatory computation for a threshold type
 */
function findMostRecentComputation(regulationComputations, thresholdType) {
  let mostRecentComputation = null;
  let mostRecentDate = null;

  regulationComputations.forEach(dayData => {
    if (dayData.regulationComputations) {
      const matchingComp = dayData.regulationComputations.find(
        comp => comp.regulationCheck?.type === thresholdType
      );

      if (matchingComp) {
        const dayDate = new Date(dayData.day);
        if (!mostRecentDate || dayDate > mostRecentDate) {
          mostRecentDate = dayDate;
          mostRecentComputation = {
            ...matchingComp,
            day: dayData.day
          };
        }
      }
    }
  });

  return mostRecentComputation;
}

/**
 * Calculate overall compliance summary
 */
function calculateOverallSummary(regulatoryData) {
  if (!regulatoryData?.regulationComputations) {
    return {
      totalThresholds: 0,
      compliantThresholds: 0,
      compliancePercentage: 0
    };
  }

  const allThresholdTypes = [
    "minimumDailyRest",
    "maximumWorkDayTime",
    "enoughBreak",
    "maximumUninterruptedWorkTime",
    "maximumWorkedDaysInWeek",
    "maximumWorkInCalendarWeek"
  ];

  let compliantCount = 0;
  const totalCount = allThresholdTypes.length;

  allThresholdTypes.forEach(thresholdType => {
    const computation = findMostRecentComputation(
      regulatoryData.regulationComputations,
      thresholdType
    );

    if (computation && computation.success) {
      compliantCount++;
    }
  });

  return {
    totalThresholds: totalCount,
    compliantThresholds: compliantCount,
    compliancePercentage: Math.round((compliantCount / totalCount) * 100)
  };
}

/**
 * Utility hook for regulatory data without state management
 * Useful for read-only components that don't need filtering
 */
export function useRegulatoryThresholdsReadOnly(regulatoryData) {
  return useMemo(() => {
    if (!regulatoryData) return null;

    return {
      daily: processCategoryThresholds("daily", regulatoryData),
      weekly: processCategoryThresholds("weekly", regulatoryData),
      summary: calculateOverallSummary(regulatoryData)
    };
  }, [regulatoryData]);
}
