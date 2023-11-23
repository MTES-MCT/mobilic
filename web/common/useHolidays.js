import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import { LOG_HOLIDAY_MUTATION } from "common/utils/apiQueries";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "./Snackbar";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export const useHolidays = () => {
  const modals = useModals();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const store = useStoreSyncedWithLocalStorage();
  const companies = store.companies();
  const history = useHistory();

  const openHolidaysModal = () => {
    modals.open("LogHoliday", {
      companies,
      handleContinue: async payload => {
        await alerts.withApiErrorHandling(
          async () => {
            await api.graphQlMutate(LOG_HOLIDAY_MUTATION, payload);
            alerts.success(
              "Votre congé ou absence a bien été enregistré(e)",
              "",
              6000
            );
            setTimeout(() => {
              //TODO: redirect to correct day
              history.go(`/app/history`);
            }, 1000);
          },
          "logHoliday",
          graphQLError => {
            if (graphQLErrorMatchesCode(graphQLError, "OVERLAPPING_MISSIONS")) {
              return "Des activités sont déjà enregistrées sur cette période.";
            }
          }
        );
      }
    });
  };

  return { openHolidaysModal };
};
