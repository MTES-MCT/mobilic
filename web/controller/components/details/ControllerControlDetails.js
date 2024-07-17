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
import { useReportInfractions } from "../../utils/useReportInfractions";
import { canDownloadBDC } from "../../utils/controlBulletin";
import { formatActivity } from "common/utils/businessTypes";

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
  const [
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
  ] = useReportInfractions(controlData);

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

    const missionData = [];
    const _coworkers = {};

    if (controlData.missions) {
      controlData.missions.forEach(mission => {
        const isMissionDeleted = !!mission.deletedAt;
        const activities = mission.activities.map(activity => ({
          ...activity,
          isMissionDeleted
        }));
        missionData.push({
          ...mission,
          ...parseMissionPayloadFromBackend(mission, controlData.user.id),
          isDeleted: isMissionDeleted,
          allActivities: _.orderBy(activities, ["startTime", "endTime"])
        });
      });

      controlData.missions.forEach(m => {
        m.activities.forEach(a => {
          _coworkers[a.user.id.toString()] = a.user;
        });
      });
    }

    if (missionData.length > 0) {
      const _missions = augmentAndSortMissions(
        missionData,
        controlData.user.id
      ).filter(m => m.activities.length > 0);
      setMissions(_missions);
      setCoworkers(_coworkers);
    } else {
      setMissions([]);
      setCoworkers([]);
    }
  }, [controlData]);

  const businesses = React.useMemo(
    () => [...new Set(employments.map(e => formatActivity(e.business)))],
    [employments]
  );

  return [
    <ControllerControlHeader
      key={0}
      controlId={controlData.id}
      controlDate={legacyTokenInfo?.creationTime}
      canDownloadXml={canDownloadBDC(controlData)}
      onCloseDrawer={onClose}
    />,
    <UserReadTabs
      key={1}
      tabs={getTabs(checkedAlertsNumber)}
      totalAlertsNumber={totalAlertsNumber}
      regulationComputationsByDay={controlData.regulationComputationsByDay}
      tokenInfo={legacyTokenInfo}
      controlTime={controlData.qrCodeGenerationTime}
      missions={missions}
      employments={employments}
      businesses={businesses}
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
      groupedAlerts={groupedAlerts}
      saveInfractions={saveInfractions}
      onUpdateInfraction={onUpdateInfraction}
      cancelInfractions={cancelInfractions}
    />
  ];
}
