import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import { LOG_HOLIDAY_MUTATION } from "common/utils/apiQueries";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "./Snackbar";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { isoFormatLocalDate } from "common/utils/time";
import { syncMissions } from "common/utils/loadUserData";

export const useHolidays = () => {
  const modals = useModals();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const store = useStoreSyncedWithLocalStorage();
  const companies = store.companies();
  const history = useHistory();

  const openHolidaysModal = () => {
    modals.open("logHoliday", {
      companies,
      handleContinue: async payload => {
        await alerts.withApiErrorHandling(
          async () => {
            const missionHolidayResponse = await api.graphQlMutate(
              LOG_HOLIDAY_MUTATION,
              payload
            );
            alerts.success(
              "Votre congé ou absence a bien été enregistré(e)",
              "",
              6000
            );
            if (missionHolidayResponse?.data?.activities?.logHoliday) {
              syncMissions(
                [missionHolidayResponse.data.activities.logHoliday],
                [],
                store,
                store.addToEntityObject
              );
            }
            setTimeout(() => {
              const redirectParams = {
                day: isoFormatLocalDate(payload.startTime)
              };
              const searchParams = new URLSearchParams(
                redirectParams
              ).toString();
              history.push(`/app/history?${searchParams}`);
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

  const closeHolidaysModal = () => {
    modals.close("logHoliday");
  };

  return { openHolidaysModal, closeHolidaysModal };
};
