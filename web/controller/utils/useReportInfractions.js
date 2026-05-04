import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import React from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useModals } from "common/utils/modals";
import { formatApiError } from "common/utils/errors";
import { getAlertsGroupedByDay } from "common/utils/regulation/groupAlertsByDay";
import { isoFormatLocalDate, strToUnixTimestamp } from "common/utils/time";
import { CONTROLLER_SAVE_REPORTED_INFRACTIONS } from "common/utils/apiQueries/controller";
import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";

export const useReportInfractions = (controlData) => {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const modals = useModals();
  const [
    reportedInfractionsLastUpdateTime,
    setReportedInfractionsLastUpdateTime
  ] = React.useState(controlData.reportedInfractionsLastUpdateTime);
  const [
    reportedCustomInfractionsLastUpdateTime,
    setReportedCustomInfractionsLastUpdateTime
  ] = React.useState(controlData.reportedCustomInfractionsLastUpdateTime);
  const [observedInfractions, setObservedInfractions] = React.useState([]);

  const [isReportingInfractions, setIsReportingInfractions] =
    React.useState(false);
  const [hasModifiedInfractions, setHasModifiedInfractions] =
    React.useState(false);
  const [natinfViewMode, setNatinfViewMode] = React.useState('list');

  React.useEffect(() => {
    setReportedInfractionsLastUpdateTime(
      controlData.reportedInfractionsLastUpdateTime
    );
  }, [controlData.reportedInfractionsLastUpdateTime]);

  React.useEffect(() => {
    setReportedCustomInfractionsLastUpdateTime(
      controlData.reportedCustomInfractionsLastUpdateTime
    );

  }, [controlData.reportedCustomInfractionsLastUpdateTime]);

  React.useEffect(() => {
    setObservedInfractions(controlData.observedInfractions);
  }, [controlData.observedInfractions]);

  const groupedAlerts = React.useMemo(() => {
    return observedInfractions
      ? getAlertsGroupedByDay(observedInfractions)
      : [];
  }, [observedInfractions]);

  const saveInfractions = async ({ showSuccessMessage = true, infractionsOverride = null } = {}) => {
    withLoadingScreen(async () => {
      try {
        const infractionsToSave = infractionsOverride ?? observedInfractions;
        const reportedInfractionsPayload = infractionsToSave
          .filter((infraction) => infraction.isReported)
          .map(({ date, sanction, unit, type, label, description, articles }) => ({
            dateStr: isoFormatLocalDate(date),
            sanction,
            unit,
            type,
            ...(type === "custom" && {
              customLabel: label,
              customDescription: description,
              customArticles: articles
            })
          }));
        
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_REPORTED_INFRACTIONS,
          {
            controlId: controlData?.id,
            reportedInfractions: reportedInfractionsPayload
          },
          { context: { nonPublicApi: true } }
        );
        const {
          reportedInfractionsLastUpdateTime:
            newReportedInfractionsLastUpdateTime,
          reportedCustomInfractionsLastUpdateTime:
            newReportedCustomInfractionsLastUpdateTime,
          observedInfractions: newObservedInfractions
        } = apiResponse.data.controllerSaveReportedInfractions;
        setReportedInfractionsLastUpdateTime(
          newReportedInfractionsLastUpdateTime
        );
        setReportedCustomInfractionsLastUpdateTime(
          newReportedCustomInfractionsLastUpdateTime
        );
        
        const newObservedInfractionsWithDates = newObservedInfractions.map(
          (o) => ({
            ...o,
            date: o.date ? strToUnixTimestamp(o.date) : null
          })
        );
        
        setObservedInfractions(newObservedInfractionsWithDates);
        controlData.observedInfractions = newObservedInfractionsWithDates;
        if (showSuccessMessage) {
          alerts.success(
            infractionsToSave.length === 1
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
    setObservedInfractions((currentObservedInfractions) =>
      currentObservedInfractions.map((infraction) =>
        infraction.date === date && infraction.sanction === sanction
          ? { ...infraction, isReported: checked }
          : infraction
      )
    );

    setHasModifiedInfractions(true);
  };

  const onAddInfraction = (sanction, date) => {
    let hasInsertedNewOne = false;
    setObservedInfractions((currentObservedInfractions) =>
      currentObservedInfractions.flatMap((infraction) => {
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
      observedInfractions.filter(
        (infraction) => infraction.sanction === sanction
      ).length === 1;
    setObservedInfractions((currentObservedInfractions) =>
      currentObservedInfractions.flatMap((infraction) => {
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

  const addCustomInfractions = (customInfractionsForAPI) => {
    if (!customInfractionsForAPI || customInfractionsForAPI.length === 0) {
      return;
    }

    setObservedInfractions((currentObservedInfractions) => [
      ...currentObservedInfractions,
      ...customInfractionsForAPI.map((customInfraction) => ({
        sanction: customInfraction.sanction,
        date: strToUnixTimestamp(customInfraction.dateStr),
        type: customInfraction.type,
        isReported: true,
        isReportable: true,
        label: (customInfraction.customLabel || "").trim() || customInfraction.sanction,
        description: (customInfraction.customDescription || "").trim(),
        articles: (customInfraction.customArticles || "").trim(),
        unit: PERIOD_UNITS.DAY,
        business: null
      }))
    ]);
    setHasModifiedInfractions(true);
  };

  const removeCustomInfractionsBySanction = (sanction) => {
    setObservedInfractions((current) =>
      current.filter(inf => !(inf.sanction === sanction && inf.type === "custom"))
    );
    setHasModifiedInfractions(true);
  };

  const checkedAlertsNumber = React.useMemo(
    () =>
      groupedAlerts
        ? groupedAlerts.reduce(
            (curr, alertsGroup) =>
              curr + alertsGroup.alerts.filter((alert) => alert.checked).length,
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
              alertsGroup.alerts.filter((alert) => alert.reportable).length,
            0
          )
        : 0,
    [groupedAlerts]
  );

  return {
    reportedInfractionsLastUpdateTime,
    reportedCustomInfractionsLastUpdateTime,
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
    onRemoveInfraction,
    addCustomInfractions,
    removeCustomInfractionsBySanction,
    natinfViewMode,
    setNatinfViewMode,
    observedInfractions
  };
};
