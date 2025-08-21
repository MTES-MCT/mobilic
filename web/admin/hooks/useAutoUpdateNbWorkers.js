import React from "react";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { UPDATE_COMPANY_DETAILS } from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";

export function useAutoUpdateNbWorkers(company, validEmployments, adminStore) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const prevCountRef = React.useRef(validEmployments.length);

  React.useEffect(() => {
    const currentCount = validEmployments.length;
    const prevCount = prevCountRef.current;
    const declaredNbWorkers = company?.nbWorkers || 0;
    if (
      currentCount > prevCount &&
      declaredNbWorkers > 0 &&
      currentCount > declaredNbWorkers
    ) {
      const updateNbWorkers = async () => {
        try {
          await api.graphQlMutate(UPDATE_COMPANY_DETAILS, {
            companyId: company.id,
            newNbWorkers: currentCount
          });

          adminStore.dispatch({
            type: ADMIN_ACTIONS.updateCompanyNameAndPhoneNumber,
            payload: {
              companyId: company.id,
              companyNbWorkers: currentCount
            }
          });

          alerts.success(
            `Nombre de salariés mis à jour automatiquement : ${currentCount}`,
            "auto-update-nb-workers",
            6000
          );
        } catch (err) {
          alerts.error(
            `Erreur lors de la mise à jour automatique : ${err.message}`,
            "auto-update-nb-workers-error",
            6000
          );
        }
      };

      updateNbWorkers();
    }

    prevCountRef.current = currentCount;
  }, [
    validEmployments.length,
    company?.id,
    company?.nbWorkers,
    api,
    adminStore,
    alerts
  ]);
}
