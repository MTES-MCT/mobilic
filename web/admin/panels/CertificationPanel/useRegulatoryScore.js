import { useCompanyRegulatoryScore } from "../../utils/useCompanyRegulatoryScore";

export function useRegulatoryScore(companyId) {
  const { regulatoryScore, loading, error } = useCompanyRegulatoryScore(
    companyId
  );

  if (!regulatoryScore || loading || error) {
    return { compliant: 0, total: 6 };
  }

  return {
    compliant: regulatoryScore.compliant,
    total: regulatoryScore.total
  };
}
