import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useModals } from "common/utils/modals";
import { CONTROLLER_SAVE_REPORTED_INFRACTIONS } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { getAlertsGroupedByDay } from "common/utils/regulation/groupAlertsByDay";
import { isoFormatLocalDate, strToUnixTimestamp } from "common/utils/time";

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
              .map(({ date, sanction, unit, type }) => ({
                dateStr: isoFormatLocalDate(date),
                sanction,
                unit,
                type
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
        const newObservedInfractionsWithDates = newObservedInfractions.map(
          o => ({
            ...o,
            date: o.date ? strToUnixTimestamp(o.date) : null
          })
        );
        setObservedInfractions(newObservedInfractionsWithDates);
        controlData.observedInfractions = newObservedInfractionsWithDates;
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

  const onAddInfraction = (sanction, date) => {
    let hasInsertedNewOne = false;
    setObservedInfractions(currentObservedInfractions =>
      currentObservedInfractions.flatMap(infraction => {
        if (infraction.sanction !== sanction) {
          return [infraction];
        }
        if (!infraction.date) {
          return [{ ...infraction, date, isReported: true }];
        }
        if (!hasInsertedNewOne) {
          hasInsertedNewOne = true;
          return [
            infraction,
            {
              ...infraction,
              date,
              isReported: true
            }
          ];
        } else {
          return [infraction];
        }
      })
    );
    setHasModifiedInfractions(true);
  };

  const onRemoveInfraction = (sanction, date) => {
    const isOnlyOne =
      observedInfractions.filter(infraction => infraction.sanction === sanction)
        .length === 1;
    setObservedInfractions(currentObservedInfractions =>
      currentObservedInfractions.flatMap(infraction => {
        if (infraction.sanction !== sanction) {
          return [infraction];
        }
        if (isOnlyOne) {
          return [
            {
              ...infraction,
              date: null,
              isReported: false
            }
          ];
        } else {
          if (infraction.date === date) {
            return [];
          } else {
            return [infraction];
          }
        }
      })
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

  return {
    reportedInfractionsLastUpdateTime,
    groupedAlerts,
    checkedAlertsNumber,
    totalAlertsNumber,
    isReportingInfractions,
    setIsReportingInfractions,
    hasModifiedInfractions,
    saveInfractions,
    cancelInfractions,
    onUpdateInfraction,
    onAddInfraction,
    onRemoveInfraction
  };
};
