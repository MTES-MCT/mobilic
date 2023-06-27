import React from "react";
import { useApi } from "common/utils/api";
import { useAdminCompanies } from "../store/store";
import { COMPANY_CERTIFICATION_COMMUNICATION_QUERY } from "common/utils/apiQueries";
import { readCookie, setCookie } from "common/utils/cookie";
import { isDateInCurrentMonth } from "common/utils/time";

const DISMISS_TIME_COOKIE_NAME = "certificateInfoDismissTime";

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
  if (dismissedCookieThisMonthExists()) {
    return false;
  }
  if (!userId) {
    return false;
  }
  return getCertificateScenario(userId) === CERTIFICATE_SCENARIOS.SCENARIO_A;
};

export const shouldDisplayBadge = userId => {
  if (dismissedCookieThisMonthExists()) {
    return false;
  }
  if (!userId) {
    return false;
  }
  return !shouldDisplayBanner(userId);
};

const dismissedCookieThisMonthExists = () => {
  const cookieDateTime = readCookie(DISMISS_TIME_COOKIE_NAME);
  if (!cookieDateTime) {
    return false;
  }
  return isDateInCurrentMonth(new Date(cookieDateTime));
};

export const dismissCertificateInfo = () => {
  setCookie(DISMISS_TIME_COOKIE_NAME, new Date(), true);
};
