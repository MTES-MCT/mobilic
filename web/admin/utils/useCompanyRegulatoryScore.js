import { useState, useEffect, useCallback } from "react";

/**
 * useCompanyRegulatoryScore - Company-wide regulatory score hook
 * MOCKUP VERSION - Returns static data for development
 * TODO: Replace with real API calls when backend is ready
 */
export function useCompanyRegulatoryScore(companyId) {
  const [regulatoryScore, setRegulatoryScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * MOCKUP: Generate realistic regulatory score data
   * Returns consistent data based on companyId to simulate real behavior
   */
  const generateMockupScore = useCallback(() => {
    if (!companyId) return null;

    // Use companyId to generate consistent mockup data
    const seed = companyId % 5;
    const mockupScores = [
      { compliant: 3, total: 6 }, // 50% compliant
      { compliant: 4, total: 6 }, // 67% compliant  
      { compliant: 2, total: 6 }, // 33% compliant
      { compliant: 5, total: 6 }, // 83% compliant
      { compliant: 1, total: 6 }, // 17% compliant
    ];

    return {
      compliant: mockupScores[seed].compliant,
      total: mockupScores[seed].total,
      details: [
        { type: "minimumDailyRest", compliant: seed >= 0, totalAlerts: seed * 2, significantAlerts: seed > 2 ? 1 : 0 },
        { type: "maximumWorkDayTime", compliant: seed >= 1, totalAlerts: seed * 3, significantAlerts: seed > 3 ? 1 : 0 },
        { type: "enoughBreak", compliant: seed >= 2, totalAlerts: seed * 1, significantAlerts: seed > 1 ? 1 : 0 },
        { type: "maximumUninterruptedWorkTime", compliant: seed >= 3, totalAlerts: seed * 2, significantAlerts: seed > 0 ? 1 : 0 },
        { type: "maximumWorkedDaysInWeek", compliant: seed >= 4, totalAlerts: seed * 1, significantAlerts: seed > 4 ? 1 : 0 },
        { type: "maximumWorkInCalendarWeek", compliant: seed >= 1, totalAlerts: seed * 4, significantAlerts: seed > 2 ? 1 : 0 }
      ]
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      setRegulatoryScore(null);
      setLoading(false);
      return;
    }

    // Simulate API loading delay
    setLoading(true);
    setError(null);
    
    const timer = setTimeout(() => {
      const mockupData = generateMockupScore();
      setRegulatoryScore(mockupData);
      setLoading(false);
    }, 100); // Short delay to simulate network

    return () => clearTimeout(timer);
  }, [companyId, generateMockupScore]);

  const refetch = useCallback(() => {
    // MOCKUP: Simulate refetch by regenerating data
    const mockupData = generateMockupScore();
    setRegulatoryScore(mockupData);
  }, [generateMockupScore]);

  return {
    regulatoryScore,
    loading,
    error,
    refetch
  };
}