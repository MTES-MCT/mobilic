import { useCompanyRegulatoryScore } from "../../utils/useCompanyRegulatoryScore";

/**
 * useRegulatoryScore - Company-wide regulatory compliance hook
 * 
 * REFACTORED: Now uses company-wide regulatory data instead of single employee data
 * This ensures consistency with backend certification calculations which analyze
 * all company employees, not just one individual.
 * 
 * Returns the same interface (compliant, total) but with proper company-wide data.
 */
export function useRegulatoryScore(companyId) {
  const { regulatoryScore, loading, error } = useCompanyRegulatoryScore(companyId);

  // Return consistent interface with previous implementation
  if (!regulatoryScore || loading || error) {
    return { compliant: 0, total: 6 };
  }

  return {
    compliant: regulatoryScore.compliant,
    total: regulatoryScore.total
  };
}
