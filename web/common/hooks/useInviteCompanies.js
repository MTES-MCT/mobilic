import { useApi } from "common/utils/api";
import { useCallback } from "react";
import { useSnackbarAlerts } from "../Snackbar";
import { useAdminStore } from "../../admin/store/store";
import { INVITE_COMPANIES_MUTATION } from "common/utils/apiQueries/admin";

export const useInviteCompanies = (onSucess) => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const adminStore = useAdminStore();

  const inviteCompanies = useCallback(
    async (emails) => {
      await alerts.withApiErrorHandling(async () => {
        await api.graphQlMutate(
          INVITE_COMPANIES_MUTATION,
          { companyId: adminStore.companyId, emails },
          { context: { nonPublicApi: true } }
        );
        alerts.success("Votre demande a été prise en compte.", null, 6000);
        if (onSucess) {
          onSucess();
        }
      });
    },
    [adminStore.companyId]
  );

  return { inviteCompanies };
};
