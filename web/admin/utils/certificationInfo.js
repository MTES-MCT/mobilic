import React from "react";
import { useApi } from "common/utils/api";
import { useAdminCompanies, useAdminStore } from "../store/store";
import {
  ADD_CERTIFICATION_INFO_RESULT,
  COMPANY_CERTIFICATION_COMMUNICATION_QUERY
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";

export const CERTIFICATE_SCENARIOS = {
  // SCENARIO_A: "Certificate banner", // deactivated
  SCENARIO_B: "Certificate badge"
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
        employmentId: adminStore.employmentId,
        action: result,
        scenario: CERTIFICATE_SCENARIOS.SCENARIO_B
      },
      { context: { nonPublicApi: true } }
    );
    if (result !== CERTIFICATE_ACTIONS.LOAD) {
      adminStore.dispatch({
        type: ADMIN_ACTIONS.updateShouldSeeCertificateInfo,
        payload: { shouldSeeCertificateInfo: false }
      });
    }
  };

  const sendSuccess = () => sendResult(CERTIFICATE_ACTIONS.SUCCESS)();
  const sendClose = () => sendResult(CERTIFICATE_ACTIONS.CLOSE)();
  const sendLoad = () => sendResult(CERTIFICATE_ACTIONS.LOAD)();

  return [sendSuccess, sendClose, sendLoad];
}

export function useShouldDisplayBadge() {
  const adminStore = useAdminStore();
  const [shouldDisplayBadge, setShouldDisplayBadge] = React.useState(false);

  React.useEffect(() => {
    const { userId, shouldSeeCertificateInfo } = adminStore;
    if (!userId || !shouldSeeCertificateInfo) {
      setShouldDisplayBadge(false);
      return;
    }

    setShouldDisplayBadge(true);
  }, [adminStore.userId, adminStore.shouldSeeCertificateInfo]);

  return shouldDisplayBadge;
}
