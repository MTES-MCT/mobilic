import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import {
  ACCEPT_CGU_MUTATION,
  REJECT_CGU_MUTATION
} from "common/utils/apiQueries";
import { useSnackbarAlerts } from "./Snackbar";

export const useCgu = () => {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const userId = store.userId();
  const cguVersion = React.useMemo(
    () => store.userInfo().userAgreementStatus?.cguVersion,
    [store.userInfo().userAgreementStatus?.cguVersion]
  );

  const updateCgu = async accept => {
    const apiResponse = await api.graphQlMutate(
      accept ? ACCEPT_CGU_MUTATION : REJECT_CGU_MUTATION,
      { userId, cguVersion },
      { context: { nonPublicApi: true } }
    );
    const response = accept
      ? apiResponse.data.account.acceptCgu
      : apiResponse.data.account.rejectCgu;
    await store.setUserInfo({
      ...store.userInfo(),
      userAgreementStatus: response
    });
  };

  const acceptCgu = React.useCallback(async () => {
    await alerts.withApiErrorHandling(updateCgu(true), "acceptCgu");
  }, [cguVersion, userId]);

  const rejectCgu = React.useCallback(async () => {
    await alerts.withApiErrorHandling(updateCgu(false), "rejectCgu");
  }, [cguVersion, userId]);

  return { acceptCgu, rejectCgu };
};
