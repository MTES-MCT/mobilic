import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { USER_READ_REGULATION_COMPUTATIONS_QUERY } from "common/utils/apiQueries";
import { getThresholdConfig } from "../panels/CertificationPanel/regulatoryThresholdConstants";

/**
 * useRegulatoryThresholds - DSFR v1.26 Compatible Hook
 * State management for regulatory thresholds data and filtering
 * Integrates with existing GraphQL infrastructure
 */
export function useRegulatoryThresholds(companyId) {
  const api = useApi();

  // Filter state
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  });

  // Data state
  const [regulatoryData, setRegulatoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Company employees data
  const [employees, setEmployees] = useState([]);

  /**
   * Fetch regulatory computations data
   * Uses existing GraphQL query infrastructure
   */
  const fetchRegulatoryData = useCallback(async () => {
    if (!companyId) return;

    setLoading(true);
    setError(null);

    try {
      // Get employees list if "all" is selected, otherwise use specific employee
      const targetEmployees =
        selectedEmployee === "all"
          ? employees
          : employees.filter(emp => emp.id.toString() === selectedEmployee);

      if (targetEmployees.length === 0) {
        setRegulatoryData(null);
        return;
      }

      // Fetch regulatory data for each employee
      const regulatoryPromises = targetEmployees.map(employee =>
        api.graphQlMutate(
          USER_READ_REGULATION_COMPUTATIONS_QUERY,
          {
            userId: employee.id,
            fromDate: dateRange.start?.toISOString().split("T")[0],
            toDate: dateRange.end?.toISOString().split("T")[0]
          },
          { context: { nonPublicApi: true } }
        )
      );

      const results = await Promise.all(regulatoryPromises);

      // Aggregate results from all employees
      const aggregatedData = aggregateRegulatoryResults(
        results,
        targetEmployees
      );
      setRegulatoryData(aggregatedData);
    } catch (err) {
      console.error("Error fetching regulatory data:", err);
      setError(formatApiError(err));
      setRegulatoryData(null);
    } finally {
      setLoading(false);
    }
  }, [api, companyId, selectedEmployee, dateRange, employees]);

  /**
   * Fetch employees list for the company
   */
  const fetchEmployees = useCallback(async () => {
    if (!companyId) return;

    try {
      // TODO: Replace with actual employees query
      // For now using mock data structure
      const mockEmployees = [
        { id: 1, firstName: "Jean", lastName: "Dupont" },
        { id: 2, firstName: "Marie", lastName: "Martin" },
        { id: 3, firstName: "Pierre", lastName: "Dubois" }
      ];

      setEmployees(mockEmployees);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setEmployees([]);
    }
  }, [companyId]);

  // Fetch employees on mount and when company changes
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Fetch regulatory data when filters change
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

  /**
   * Filter handlers
   */
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
    // Filter state
    selectedEmployee,
    setSelectedEmployee: handleEmployeeChange,
    dateRange,
    setDateRange: handleDateRangeChange,

    // Data state
    calculatedThresholds,
    rawRegulatoryData: regulatoryData,
    employees,

    // Loading state
    loading,
    error,

    // Actions
    refreshData,

    // Utility
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
        // Find existing day entry or create new one
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

        // Add employee's computations for this day
        if (dayData.regulationComputations) {
          dayData.regulationComputations.forEach(computation => {
            existingDay.regulationComputations.push({
              ...computation,
              employeeId: employees[index]?.id,
              employeeName: `${employees[index]?.firstName} ${employees[index]?.lastName}`
            });
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

      // Find the most recent computation for this threshold type
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
