import { useState, useEffect, useMemo, useCallback } from "react";
import { useApi } from "common/utils/api";
import { formatApiError } from "common/utils/errors";
import { USER_READ_REGULATION_COMPUTATIONS_QUERY } from "common/utils/apiQueries";
import { useAdminStore } from "../store/store";

/**
 * useRegulatoryData - Regulatory Data Fetching Hook
 * Fetches regulatory computations data for certificate calculations
 */
export function useRegulatoryData(companyId) {
  const api = useApi();
  const adminStore = useAdminStore();

  const [regulatoryData, setRegulatoryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const employees = useMemo(
    () => adminStore.users?.filter(u => u.companyId === companyId) || [],
    [adminStore.users, companyId]
  );

  /**
   * Fetch regulatory computations data for the current month
   * Used by certificate calculations
   */
  /**
   * MOCKUP VERSION: Generate static regulatory data
   * TODO: Replace with real API when ready
   */
  const generateMockupData = useCallback(() => {
    if (!companyId) return null;

    // Generate consistent mockup data based on companyId
    const seed = companyId % 3;
    const mockupComputations = [
      {
        day: "2025-08-01",
        regulationComputations: [
          { success: true, regulationCheck: { type: "minimumDailyRest" } },
          { success: false, regulationCheck: { type: "maximumWorkDayTime" } },
          { success: true, regulationCheck: { type: "enoughBreak" } }
        ]
      },
      {
        day: "2025-08-02", 
        regulationComputations: [
          { success: true, regulationCheck: { type: "maximumUninterruptedWorkTime" } },
          { success: seed > 0, regulationCheck: { type: "maximumWorkedDaysInWeek" } },
          { success: seed > 1, regulationCheck: { type: "maximumWorkInCalendarWeek" } }
        ]
      }
    ];

    return {
      regulationComputations: mockupComputations
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      setRegulatoryData(null);
      setLoading(false);
      return;
    }

    // Simulate loading delay
    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      const mockupData = generateMockupData();
      setRegulatoryData(mockupData);
      setLoading(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [companyId, generateMockupData]);

  const refetch = useCallback(() => {
    const mockupData = generateMockupData();
    setRegulatoryData(mockupData);
  }, [generateMockupData]);

  return {
    rawRegulatoryData: regulatoryData,
    hasData: Boolean(regulatoryData?.regulationComputations?.length),
    loading,
    error,
    refetch
  };
}