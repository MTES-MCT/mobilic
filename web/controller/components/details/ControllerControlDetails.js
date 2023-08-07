import { UserReadTabs } from "../../../control/components/UserReadTabs";
import React from "react";
import { getTabs } from "../../../control/UserRead";
import {
  augmentAndSortMissions,
  parseMissionPayloadFromBackend
} from "common/utils/mission";
import { getStartOfDay, unixToJSTimestamp } from "common/utils/time";
import { orderEmployments } from "common/utils/employments";
import { ControllerControlHeader } from "./ControllerControlHeader";
import _ from "lodash";
import { ControlBulletinDrawer } from "../controlBulletin/ControlBulletinDrawer";
import { getAlertsGroupedByDay } from "common/utils/regulation/groupAlertsByDay";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { CONTROLLER_SAVE_REPORTED_INFRACTIONS } from "common/utils/apiQueries";
import { useModals } from "common/utils/modals";

export function ControllerControlDetails({
  controlData,
  setControlData,
  onClose
}) {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const modals = useModals();
  const [employments, setEmployments] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [coworkers, setCoworkers] = React.useState([]);
  const [periodOnFocus, setPeriodOnFocus] = React.useState(null);
  const [isEditingBC, setIsEditingBC] = React.useState(false);
  const [isReportingInfractions, setIsReportingInfractions] = React.useState(
    false
  );
  const [hasModifiedInfractions, setHasModifiedInfractions] = React.useState(
    false
  );
  const [
    reportedInfractionsLastUpdateTime,
    setReportedInfractionsLastUpdateTime
  ] = React.useState(controlData.reportedInfractionsLastUpdateTime);
  const [reportedInfractions, setReportedInfractions] = React.useState([]);
  const groupedAlerts = React.useMemo(
    () =>
      reportedInfractions
        ? getAlertsGroupedByDay(
            controlData.regulationComputationsByDay,
            reportedInfractions
          )
        : [],
    [reportedInfractions]
  );

  React.useEffect(() => {
    setReportedInfractions(controlData.reportedInfractions);
  }, [controlData.reportedInfractions]);

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
          "Les infractions relevées ont été enregistrées",
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

  // Keep this Object to Reuse existing tabs. To adapt when unauthenticated control will be removed
  const legacyTokenInfo = {
    creationDay: new Date(unixToJSTimestamp(controlData.qrCodeGenerationTime)),
    historyStartDay: controlData.historyStartDate,
    creationTime: controlData.creationTime
  };

  React.useEffect(() => {
    if (controlData.employments) {
      setEmployments(orderEmployments(controlData.employments));
      const _vehicles = {};
      controlData.employments.forEach(e => {
        e.company.vehicles.forEach(v => {
          _vehicles[v.id.toString()] = v;
        });
      });
      setVehicles(_vehicles);
    } else {
      setEmployments([]);
      setVehicles([]);
    }

    if (controlData.missions) {
      const _missions = augmentAndSortMissions(
        controlData.missions.map(m => ({
          ...m,
          ...parseMissionPayloadFromBackend(m, controlData.user.id),
          allActivities: _.orderBy(m.activities, ["startTime", "endTime"])
        })),
        controlData.user.id
      ).filter(m => m.activities.length > 0);
      setMissions(_missions);

      const _coworkers = {};
      controlData.missions.forEach(m => {
        m.activities.forEach(a => {
          _coworkers[a.user.id.toString()] = a.user;
        });
      });
      setCoworkers(_coworkers);
    } else {
      setMissions([]);
      setCoworkers([]);
    }
  }, [controlData]);

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
    <ControllerControlHeader
      key={0}
      controlId={controlData.id}
      controlDate={legacyTokenInfo?.creationTime}
      onCloseDrawer={onClose}
    />,
    <UserReadTabs
      key={1}
      tabs={getTabs(alertsNumber)}
      regulationComputationsByDay={controlData.regulationComputationsByDay}
      tokenInfo={legacyTokenInfo}
      controlTime={controlData.qrCodeGenerationTime}
      missions={missions}
      employments={employments}
      coworkers={coworkers}
      vehicles={vehicles}
      periodOnFocus={periodOnFocus}
      setPeriodOnFocus={setPeriodOnFocus}
      workingDaysNumber={controlData.nbControlledDays || 0}
      allowC1BExport={false}
      controlId={controlData.id}
      companyName={controlData.companyName}
      vehicleRegistrationNumber={controlData.vehicleRegistrationNumber}
      openBulletinControl={() => setIsEditingBC(true)}
      controlData={controlData}
      reportedInfractionsLastUpdateTime={reportedInfractionsLastUpdateTime}
      isReportingInfractions={isReportingInfractions}
      setIsReportingInfractions={setIsReportingInfractions}
      groupedAlerts={groupedAlerts}
      saveInfractions={saveInfractions}
      cancelInfractions={cancelInfractions}
      onUpdateInfraction={onUpdateInfraction}
      hasModifiedInfractions={hasModifiedInfractions}
      readOnlyAlerts={false}
    />,
    <ControlBulletinDrawer
      key={2}
      isOpen={isEditingBC}
      onClose={() => setIsEditingBC(false)}
      controlData={controlData}
      onSaveControlBulletin={newControlData =>
        setControlData(prevControlData => ({
          ...prevControlData,
          ...newControlData
        }))
      }
    />
  ];
}
