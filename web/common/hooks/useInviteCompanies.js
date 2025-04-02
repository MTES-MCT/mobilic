import { useApi } from "common/utils/api";
import { useCallback } from "react";
import { useSnackbarAlerts } from "../Snackbar";
import { useAdminStore } from "../../admin/store/store";
import { formatApiError } from "common/utils/errors";
import { HTTP_QUERIES } from "common/utils/apiQueries";

export const useInviteCompanies = onSucess => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const adminStore = useAdminStore();

  const inviteCompanies = useCallback(
    async emails => {
      try {
        await api.jsonHttpQuery(HTTP_QUERIES.inviteCompanies, {
          json: { emails, company_id: adminStore.companyId }
        });
        alerts.success("Votre demande a été prise en compte.", null, 6000);
        if (onSucess) {
          onSucess();
        }
      } catch (err) {
        alerts.error(formatApiError(err), "invite_companies", 6000);
      }
    },
    [adminStore.companyId]
  );

  return { inviteCompanies };
};
