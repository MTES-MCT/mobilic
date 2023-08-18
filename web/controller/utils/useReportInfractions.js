import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useModals } from "common/utils/modals";
import { CONTROLLER_SAVE_REPORTED_INFRACTIONS } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { getAlertsGroupedByDay } from "common/utils/regulation/groupAlertsByDay";

export const useReportInfractions = controlData => {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const modals = useModals();
  const [
    reportedInfractionsLastUpdateTime,
    setReportedInfractionsLastUpdateTime
  ] = React.useState(controlData.reportedInfractionsLastUpdateTime);
  const [observedInfractions, setObservedInfractions] = React.useState([]);

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
    setObservedInfractions(controlData.observedInfractions);
  }, [controlData.observedInfractions]);

  const groupedAlerts = React.useMemo(() => {
    return observedInfractions
      ? getAlertsGroupedByDay(observedInfractions)
      : [];
  }, [observedInfractions]);

  const saveInfractions = async ({ showSuccessMessage = true } = {}) => {
    withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_REPORTED_INFRACTIONS,
          {
            controlId: controlData?.id,
            reportedInfractions: observedInfractions
              .filter(infraction => infraction.isReported)
              .map(({ date, sanction }) => ({
                date,
                sanction
              }))
          },
          { context: { nonPublicApi: true } }
        );
        const {
          reportedInfractionsLastUpdateTime: newReportedInfractionsLastUpdateTime,
          observedInfractions: newObservedInfractions
        } = apiResponse.data.controllerSaveReportedInfractions;
        setReportedInfractionsLastUpdateTime(
          newReportedInfractionsLastUpdateTime
        );
        setObservedInfractions(newObservedInfractions);
        controlData.observedInfractions = newObservedInfractions;
        if (showSuccessMessage) {
          alerts.success(
            observedInfractions.length === 1
              ? "L'infraction relevée a été enregistrée "
              : "Les infractions relevées ont été enregistrées",
            "",
            3000
          );
        }
        setHasModifiedInfractions(false);
        setIsReportingInfractions(false);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });
  };

  const onCloseInfractions = () => {
    setObservedInfractions(controlData.observedInfractions);
    setIsReportingInfractions(false);
    setHasModifiedInfractions(false);
  };
  const cancelInfractions = ({ forceCancel = false } = {}) => {
    if (forceCancel) {
      onCloseInfractions();
    } else {
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
    }
  };

  const onUpdateInfraction = (sanction, date, checked) => {
    setObservedInfractions(currentObservedInfractions =>
      currentObservedInfractions.map(infraction =>
        infraction.date === date && infraction.sanction === sanction
          ? { ...infraction, isReported: checked }
          : infraction
      )
    );

    setHasModifiedInfractions(true);
  };

  const checkedAlertsNumber = React.useMemo(
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

  const totalAlertsNumber = React.useMemo(
    () =>
      groupedAlerts
        ? groupedAlerts.reduce(
            (curr, alertsGroup) =>
              curr +
              alertsGroup.alerts.filter(alert => alert.reportable).length,
            0
          )
        : 0,
    [groupedAlerts]
  );

  return [
    reportedInfractionsLastUpdateTime,
    groupedAlerts,
    checkedAlertsNumber,
    totalAlertsNumber,
    isReportingInfractions,
    setIsReportingInfractions,
    hasModifiedInfractions,
    saveInfractions,
    cancelInfractions,
    onUpdateInfraction
  ];
};
