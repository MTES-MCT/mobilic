import { UserReadTabs } from "../../../control/components/UserReadTabs";
import React from "react";
import { getTabs } from "../../../control/UserRead";
import {
  augmentAndSortMissions,
  parseMissionPayloadFromBackend
} from "common/utils/mission";
import { unixToJSTimestamp } from "common/utils/time";
import { orderEmployments } from "common/utils/employments";
import { ControllerControlHeader } from "./ControllerControlHeader";
import _ from "lodash";
import { ControlBulletinDrawer } from "../controlBulletin/ControlBulletinDrawer";
import { getAlertsGroupedByDay } from "common/utils/regulation/groupAlertsByDay";

export function ControllerControlDetails({
  controlData,
  setControlData,
  onClose
}) {
  const [employments, setEmployments] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [coworkers, setCoworkers] = React.useState([]);
  const [periodOnFocus, setPeriodOnFocus] = React.useState(null);
  const [isEditingBC, setIsEditingBC] = React.useState(false);
  const [isReportingInfractions, setIsReportingInfractions] = React.useState(
    false
  );
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

  const saveInfractions = () => {
    console.log("saving infractions", reportedInfractions);
    setIsReportingInfractions(false);
  };
  const cancelInfractions = () => {
    setReportedInfractions(controlData.reportedInfractions);
    setIsReportingInfractions(false);
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
      groupedAlerts.reduce(
        (curr, alertsGroup) =>
          curr + alertsGroup.alerts.filter(alert => alert.checked).length,
        0
      ),
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
      isReportingInfractions={isReportingInfractions}
      setIsReportingInfractions={setIsReportingInfractions}
      setReportedInfractions={setReportedInfractions}
      groupedAlerts={groupedAlerts}
      saveInfractions={saveInfractions}
      cancelInfractions={cancelInfractions}
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
