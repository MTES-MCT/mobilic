import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import { LOG_HOLIDAY_MUTATION } from "common/utils/apiQueries";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "./Snackbar";

export const useHolidays = () => {
  const modals = useModals();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const store = useStoreSyncedWithLocalStorage();
  const companies = store.companies();

  const openHolidaysModal = () => {
    modals.open("LogHoliday", {
      companies,
      handleContinue: async payload => {
        console.log(payload);
        await alerts.withApiErrorHandling(
          async () => {
            await api.graphQlMutate(LOG_HOLIDAY_MUTATION, payload);
            alerts.success(
              "Congé ou absence a bien été enregistré(e)",
              "",
              6000
            );
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
