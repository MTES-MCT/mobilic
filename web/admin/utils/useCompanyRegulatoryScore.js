import { useState, useEffect, useCallback } from "react";

/**
 * TODO: Replace with real API calls when backend is ready
 */
export function useCompanyRegulatoryScore(companyId) {
  const [regulatoryScore, setRegulatoryScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const generateMockupScore = useCallback(() => {
    if (!companyId) return null;

    const seed = companyId % 5;
    const mockupScores = [
      { compliant: 3, total: 6 }, // 50% compliant
      { compliant: 4, total: 6 }, // 67% compliant
      { compliant: 2, total: 6 }, // 33% compliant
      { compliant: 5, total: 6 }, // 83% compliant
      { compliant: 1, total: 6 } // 17% compliant
    ];

    return {
      compliant: mockupScores[seed].compliant,
      total: mockupScores[seed].total,
      details: [
        {
          type: "minimumDailyRest",
          compliant: seed >= 0,
          totalAlerts: seed * 2,
          significantAlerts: seed > 2 ? 1 : 0
        },
        {
          type: "maximumWorkDayTime",
          compliant: seed >= 1,
          totalAlerts: seed * 3,
          significantAlerts: seed > 3 ? 1 : 0
        },
        {
          type: "enoughBreak",
          compliant: seed >= 2,
          totalAlerts: seed * 1,
          significantAlerts: seed > 1 ? 1 : 0
        },
        {
          type: "maximumUninterruptedWorkTime",
          compliant: seed >= 3,
          totalAlerts: seed * 2,
          significantAlerts: seed > 0 ? 1 : 0
        },
        {
          type: "maximumWorkedDaysInWeek",
          compliant: seed >= 4,
          totalAlerts: seed * 1,
          significantAlerts: seed > 4 ? 1 : 0
        },
        {
          type: "maximumWorkInCalendarWeek",
          compliant: seed >= 1,
          totalAlerts: seed * 4,
          significantAlerts: seed > 2 ? 1 : 0
        }
      ]
    };
  }, [companyId]);

  useEffect(() => {
    if (!companyId) {
      setRegulatoryScore(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      const mockupData = generateMockupScore();
      setRegulatoryScore(mockupData);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [companyId, generateMockupScore]);

  const refetch = useCallback(() => {
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
