import React from "react";
import { useApi } from "common/utils/api";
import { useAdminCompanies } from "../store/store";
import { COMPANY_CERTIFICATION_COMMUNICATION_QUERY } from "common/utils/apiQueries";

export function useCertificationInfo() {
  const api = useApi();
  const [, company] = useAdminCompanies();
  const [companyWithInfo, setCompanyWithInfo] = React.useState({});
  const [loadingInfo, setLoadingInfo] = React.useState(true);

  React.useEffect(async () => {
    if (company) {
      setLoadingInfo(true);
      const apiResponse = await api.graphQlQuery(
        COMPANY_CERTIFICATION_COMMUNICATION_QUERY,
        {
          companyId: company.id
        }
      );
      setCompanyWithInfo(apiResponse?.data?.company);
      setLoadingInfo(false);
    }
  }, [company]);

  return { companyWithInfo, loadingInfo };
}

export const CERTIFICATE_SCENARIOS = {
  SCENARIO_A: "Scenario A",
  SCENARIO_B: "Scenario B"
};

const getCertificateScenario = userId =>
  userId % 0 === 0
    ? CERTIFICATE_SCENARIOS.SCENARIO_A
    : CERTIFICATE_SCENARIOS.SCENARIO_B;

export const shouldDisplayBanner = userId => {
  if (!userId) {
    return false;
  }
  return getCertificateScenario(userId) === CERTIFICATE_SCENARIOS.SCENARIO_B;
};

export const shouldDisplayBadge = userId => {
  if (!userId) {
    return false;
  }
  return !shouldDisplayBanner(userId);
};
