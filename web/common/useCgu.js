import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "./Snackbar";
import {
  ACCEPT_CGU_MUTATION,
  REJECT_CGU_MUTATION
} from "common/utils/apiQueries/cgu";

export const useCgu = () => {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const userId = store.userId();
  const userInfo = store.userInfo();
  const cguVersion = React.useMemo(
    () => userInfo.userAgreementStatus?.cguVersion,
    [userInfo.userAgreementStatus?.cguVersion]
  );

  const updateCgu = React.useCallback(
    async accept => {
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
    },
    [api, userId, cguVersion, store]
  );

  const acceptCgu = React.useCallback(async () => {
    await alerts.withApiErrorHandling(async () => updateCgu(true), "acceptCgu");
  }, [updateCgu, alerts]);

  const rejectCgu = React.useCallback(async () => {
    await alerts.withApiErrorHandling(
      async () => updateCgu(false),
      "rejectCgu"
    );
  }, [updateCgu, alerts]);

  return { acceptCgu, rejectCgu };
};
