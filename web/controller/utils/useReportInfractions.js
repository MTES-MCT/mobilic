import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { ALERT_TYPES } from "common/utils/regulation/alertTypes";
import { getStartOfDay } from "common/utils/time";
import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useModals } from "common/utils/modals";
import { CONTROLLER_SAVE_REPORTED_INFRACTIONS } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { getAlertsGroupedByDay } from "common/utils/regulation/groupAlertsByDay";

export const useReportInfractions = (controlData, noLic) => {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const modals = useModals();
  const [
    reportedInfractionsLastUpdateTime,
    setReportedInfractionsLastUpdateTime
  ] = React.useState(controlData.reportedInfractionsLastUpdateTime);
  const [reportedInfractions, setReportedInfractions] = React.useState([]);

  const [isReportingInfractions, setIsReportingInfractions] = React.useState(
    false
  );
  const [hasModifiedInfractions, setHasModifiedInfractions] = React.useState(
    false
  );

  React.useEffect(() => {
    setReportedInfractionsLastUpdateTime(
      controlData.reportedInfractionsLastUpdateTime
    );
  }, [controlData.reportedInfractionsLastUpdateTime]);

  React.useEffect(() => {
    setReportedInfractions(controlData.reportedInfractions);
  }, [controlData.reportedInfractions]);

  const groupedAlerts = React.useMemo(
    () =>
      reportedInfractions
        ? noLic
          ? [
              {
                type: ALERT_TYPES.noPaperLic,
                sanction: "NATINF 23103",
                infringementLabel:
                  "Absence de livret individuel de contrôle à bord",
                description:
                  "Défaut de documents nécessaires au décompte de la durée du travail (L. 3121-67 du Code du travail et R. 3312‑58 du Code des transports + arrêté du 20 juillet 1998)",
                alerts: [
                  {
                    checked: reportedInfractions.length > 0,
                    day: controlData.creationTime,
                    extra: {
                      sanction_code: "NATINF 23103"
                    }
                  }
                ]
              }
            ]
          : getAlertsGroupedByDay(
              controlData.regulationComputationsByDay,
              reportedInfractions
            )
        : [],
    [reportedInfractions]
  );

  const saveInfractions = async () => {
    withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_REPORTED_INFRACTIONS,
          {
            controlId: controlData?.id,
            reportedInfractions: reportedInfractions.map(
              ({ date, sanction }) => ({
                date,
                sanction
              })
            )
          },
          { context: { nonPublicApi: true } }
        );
        const {
          reportedInfractionsLastUpdateTime
        } = apiResponse.data.controllerSaveReportedInfractions;
        setReportedInfractionsLastUpdateTime(reportedInfractionsLastUpdateTime);
        alerts.success(
          noLic
            ? "L'infraction relevée a été enregistrée "
            : "Les infractions relevées ont été enregistrées",
          "",
          3000
        );
        setIsReportingInfractions(false);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });
  };

  const onCloseInfractions = () => {
    setReportedInfractions(controlData.reportedInfractions);
    setIsReportingInfractions(false);
  };
  const cancelInfractions = () => {
    if (hasModifiedInfractions) {
      modals.open("confirmationCancelControlBulletinModal", {
        confirmButtonLabel: "Revenir à mes modifications",
        handleCancel: () => {
          onCloseInfractions();
        },
        handleConfirm: () => {}
      });
    } else {
      onCloseInfractions();
    }
  };

  const onUpdateInfraction = (sanction, date, checked) => {
    if (checked) {
      setReportedInfractions(curr => [
        ...curr,
        {
          sanction,
          date
        }
      ]);
    } else {
      setReportedInfractions(curr => {
        return curr.filter(
          infraction =>
            infraction.sanction !== sanction ||
            getStartOfDay(infraction.date) !== getStartOfDay(date)
        );
      });
    }
    setHasModifiedInfractions(true);
  };

  const alertsNumber = React.useMemo(
    () =>
      groupedAlerts
        ? groupedAlerts.reduce(
            (curr, alertsGroup) =>
              curr + alertsGroup.alerts.filter(alert => alert.checked).length,
            0
          )
        : 0,
    [groupedAlerts]
  );

  return [
    reportedInfractionsLastUpdateTime,
    groupedAlerts,
    alertsNumber,
    isReportingInfractions,
    setIsReportingInfractions,
    hasModifiedInfractions,
    saveInfractions,
    cancelInfractions,
    onUpdateInfraction
  ];
};
