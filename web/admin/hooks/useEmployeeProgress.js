import React from "react";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { UPDATE_COMPANY_DETAILS } from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";

function calculateProgressData(declaredNbWorkers, registeredEmployees) {
  if (declaredNbWorkers <= 0) {
    return null;
  }

  const percentage = Math.min(
    (registeredEmployees / declaredNbWorkers) * 100,
    100
  );

  let color;
  if (percentage === 100) {
    color = "info";
  } else if (percentage >= 75) {
    color = "success";
  } else if (percentage >= 25) {
    color = "warning";
  } else {
    color = "error";
  }

  const shouldShowBadge = percentage < 75;
  const shouldShowSingleInviteButton = percentage < 75;

  return {
    percentage: Math.round(percentage),
    registeredEmployees,
    declaredNbWorkers,
    color,
    shouldShowBadge,
    shouldShowSingleInviteButton
  };
}

function useAutoUpdateNbWorkers(company, validEmployments, adminStore) {
  const api = useApi();
  const alerts = useSnackbarAlerts();

  React.useEffect(() => {
    const declaredNbWorkers = company?.nbWorkers || 0;
    const registeredEmployees = validEmployments.length;

    if (declaredNbWorkers > 0 && registeredEmployees > declaredNbWorkers) {
      const updateCompanyNbWorkers = async () => {
        try {
          await api.graphQlMutate(UPDATE_COMPANY_DETAILS, {
            companyId: company.id,
            newNbWorkers: registeredEmployees
          });

          adminStore.dispatch({
            type: ADMIN_ACTIONS.updateCompanyNameAndPhoneNumber,
            companyId: company.id,
            companyName: company.name,
            companyPhoneNumber: company.phoneNumber,
            companyNbWorkers: registeredEmployees
          });

          alerts.success(
            `Nombre de salariés mis à jour automatiquement : ${registeredEmployees}`,
            "auto-update-nb-workers",
            6000
          );
        } catch (err) {
          alerts.error(formatApiError(err), "auto-update-nb-workers", 6000);
        }
      };

      updateCompanyNbWorkers();
    }
  }, [
    company?.nbWorkers,
    validEmployments.length,
    company?.id,
    company?.name,
    company?.phoneNumber,
    api,
    adminStore,
    alerts
  ]);
}

export function useEmployeeProgress(company, validEmployments, adminStore) {
  const progressData = React.useMemo(() => {
    const declaredNbWorkers = company?.nbWorkers || 0;
    const registeredEmployees = validEmployments.length;
    return calculateProgressData(declaredNbWorkers, registeredEmployees);
  }, [company?.nbWorkers, validEmployments.length]);

  useAutoUpdateNbWorkers(company, validEmployments, adminStore);

  return progressData;
}
