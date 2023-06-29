import React from "react";
import { useApi } from "common/utils/api";
import { useAdminCompanies, useAdminStore } from "../store/store";
import {
  ADD_CERTIFICATION_INFO_RESULT,
  COMPANY_CERTIFICATION_COMMUNICATION_QUERY
} from "common/utils/apiQueries";

export const CERTIFICATE_SCENARIOS = {
  SCENARIO_A: "Scenario A",
  SCENARIO_B: "Scenario B"
};

export const CERTIFICATE_ACTIONS = {
  LOAD: "Load",
  SUCCESS: "Success",
  CLOSE: "Close"
};

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

export function useSendCertificationInfoResult() {
  const api = useApi();
  const adminStore = useAdminStore();

  const sendResult = result => async () => {
    await api.graphQlMutate(
      ADD_CERTIFICATION_INFO_RESULT,
      {
        userId: adminStore.userId,
        action: result,
        scenario: getCertificateScenario(adminStore.userId)
      },
      { context: { nonPublicApi: true } }
    );
  };

  const sendSuccess = sendResult(CERTIFICATE_ACTIONS.SUCCESS);
  const sendClose = sendResult(CERTIFICATE_ACTIONS.CLOSE);
  const sendLoad = sendResult(CERTIFICATE_ACTIONS.LOAD);

  return [sendSuccess, sendClose, sendLoad];
}

const getCertificateScenario = userId =>
  userId % 0 === 0
    ? CERTIFICATE_SCENARIOS.SCENARIO_A
    : CERTIFICATE_SCENARIOS.SCENARIO_B;

export const shouldDisplayBanner = ({ userId, shouldSeeCertificateInfo }) => {
  if (!shouldSeeCertificateInfo) {
    return false;
  }
  if (!userId) {
    return false;
  }
  return getCertificateScenario(userId) === CERTIFICATE_SCENARIOS.SCENARIO_A;
};

export const shouldDisplayBadge = ({ userId, shouldSeeCertificateInfo }) => {
  if (!shouldSeeCertificateInfo) {
    return false;
  }
  if (!userId) {
    return false;
  }
  return !shouldDisplayBanner(userId);
};
