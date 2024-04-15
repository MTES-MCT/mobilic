import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useApi } from "common/utils/api";
import { LOG_HOLIDAY_MUTATION } from "common/utils/apiQueries";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "./Snackbar";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { isoFormatLocalDate } from "common/utils/time";
import { syncMissions } from "common/utils/loadUserData";
import { DISMISSABLE_WARNINGS } from "../admin/utils/dismissableWarnings";
import Alert from "@mui/material/Alert";

export const useHolidays = () => {
  const modals = useModals();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const companies = store.companies();
  const history = useHistory();

  const openHolidaysModal = () => {
    modals.open("logHoliday", {
      companies,
      handleContinue: async payload => {
        const logHolidayProcess = async () => {
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
                  missionHolidayResponse.data.activities.logHoliday,
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
              if (
                graphQLErrorMatchesCode(graphQLError, "OVERLAPPING_MISSIONS")
              ) {
                return "Des activités sont déjà enregistrées sur cette période.";
              }
            }
          );
        };

        if (
          !(
            userInfo.disabledWarnings &&
            userInfo.disabledWarnings.includes(
              DISMISSABLE_WARNINGS.EMPLOYEE_OFF_CREATION
            )
          )
        ) {
          modals.open("confirmation", {
            title: "Confirmer la validation",
            confirmButtonLabel: "Valider",
            cancelButtonLabel: "Annuler",
            disableWarningName: DISMISSABLE_WARNINGS.EMPLOYEE_OFF_CREATION,
            content: (
              <Alert severity="warning">
                Une fois le congé ou l'absence validé(e), vous ne pourrez plus y
                apporter de modification.
              </Alert>
            ),
            handleConfirm: logHolidayProcess
          });
        } else await logHolidayProcess();
      }
    });
  };

  const closeHolidaysModal = () => {
    modals.close("logHoliday");
  };

  return { openHolidaysModal, closeHolidaysModal };
};
