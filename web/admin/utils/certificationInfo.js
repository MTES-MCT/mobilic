import React from "react";
import { useApi } from "common/utils/api";
import { useAdminCompanies } from "../store/store";
import {
  ADD_CERTIFICATION_INFO_RESULT,
  COMPANY_CERTIFICATION_COMMUNICATION_QUERY
} from "common/utils/apiQueries";
import { useStoreSyncedWithLocalStorage } from "common/store/store";

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
  const store = useStoreSyncedWithLocalStorage();

  const sendResult = result => async () => {
    await api.graphQlMutate(
      ADD_CERTIFICATION_INFO_RESULT,
      {
        userId: store.userInfo().id,
        action: result,
        scenario: getCertificateScenario(store.userInfo().id)
      },
      { context: { nonPublicApi: true } }
    );
  };

  const sendSuccess = () => {
    if (store.userInfo().hasSentActionSuccess) {
      return;
    } else {
      sendResult(CERTIFICATE_ACTIONS.SUCCESS)();
      store.setUserInfo({
        ...store.userInfo(),
        hasSentActionSuccess: true,
        shouldSeeCertificateInfo: false
      });
    }
  };
  const sendClose = () => {
    if (store.userInfo().hasSentActionClose) {
      return;
    } else {
      sendResult(CERTIFICATE_ACTIONS.CLOSE)();
      store.setUserInfo({
        ...store.userInfo(),
        hasSentActionClose: true,
        shouldSeeCertificateInfo: false
      });
    }
  };
  const sendLoad = () => {
    if (store.userInfo().hasSentActionLoad) {
      return;
    } else {
      sendResult(CERTIFICATE_ACTIONS.LOAD)();
      store.setUserInfo({
        ...store.userInfo(),
        hasSentActionLoad: true
      });
    }
  };

  return [sendSuccess, sendClose, sendLoad];
}

export function useShouldDisplayScenariis() {
  const store = useStoreSyncedWithLocalStorage();

  const [shouldDisplayBanner, setShouldDisplayBanner] = React.useState(false);
  const [shouldDisplayBadge, setShouldDisplayBadge] = React.useState(false);

  React.useEffect(() => {
    const { id: userId, shouldSeeCertificateInfo } = store.userInfo();
    if (!userId || !shouldSeeCertificateInfo) {
      setShouldDisplayBanner(false);
      setShouldDisplayBadge(false);
      return;
    }
    if (getCertificateScenario(userId) === CERTIFICATE_SCENARIOS.SCENARIO_A) {
      setShouldDisplayBanner(true);
    } else {
      setShouldDisplayBadge(true);
    }
  }, [store]);

  return [shouldDisplayBadge, shouldDisplayBanner];
}

const getCertificateScenario = userId =>
  userId % 0 === 0
    ? CERTIFICATE_SCENARIOS.SCENARIO_B
    : CERTIFICATE_SCENARIOS.SCENARIO_A;
