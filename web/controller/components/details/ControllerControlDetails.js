import { UserReadTabs } from "../../../control/components/UserReadTabs";
import React from "react";
import { getTabs } from "../../../control/UserRead";
import {
  augmentAndSortMissions,
  parseMissionPayloadFromBackend
} from "common/utils/mission";
import { orderEmployments } from "common/utils/employments";
import { ControllerControlHeader } from "./ControllerControlHeader";
import _ from "lodash";
import { ControlBulletinDrawer } from "../controlBulletin/ControlBulletinDrawer";
import { formatActivity } from "common/utils/businessTypes";
import { useInfractions } from "../../utils/contextInfractions";
import { useWorkingDaysAnalysis } from "common/utils/hooks/useWorkingDaysAnalysis";
import { useTokenInfo } from "common/utils/hooks/useTokenInfo";

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
  const {
    checkedAlertsNumber,
    totalAlertsNumber,
    isReportingInfractions,
    setIsReportingInfractions,
    reportedInfractionsLastUpdateTime,
    groupedAlerts,
    natinfViewMode,
    setNatinfViewMode
  } = useInfractions();

  // Transform control data into token format for reusing existing UserRead components
  const legacyTokenInfo = useTokenInfo({ controlData });

  // Analyze working days from missions to detect:
  // - Days added "a posteriori" (registered after they occurred)
  // - Days that were modified (activity versions exist)
  const workingDaysAnalysis = useWorkingDaysAnalysis(
    missions,
    controlData.controlTime || controlData.qrCodeGenerationTime,
    legacyTokenInfo
  );

  const _onClose = () => {
    if (natinfViewMode === 'search') {
      setNatinfViewMode('list');
    } else {
      if (setIsReportingInfractions) {
        setIsReportingInfractions(false);
      }
      onClose();
    }
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
      const augmented = augmentAndSortMissions(
        missionData,
        controlData.user.id
      );
      const _missions = augmented.filter(m => m.activities.length > 0);
      
      setMissions(_missions);
      setCoworkers(_coworkers);
    } else {
      setMissions([]);
      setCoworkers([]);
    }
  }, [controlData]);

  const businesses = React.useMemo(
    () => [
      ...new Set(
        employments.map(e => formatActivity(e.business)).filter(b => !!b)
      )
    ],
    [employments]
  );

  const companySiren = React.useMemo(() => {
    return controlData?.controlBulletin?.siren || null;
  }, [controlData]);

  return (
    <>
      {natinfViewMode === 'list' && (
        <ControllerControlHeader
          controlDate={legacyTokenInfo?.controlTime}
          onCloseDrawer={_onClose}
        />
      )}
      <UserReadTabs
        tabs={getTabs(checkedAlertsNumber)}
        totalAlertsNumber={totalAlertsNumber}
        tokenInfo={legacyTokenInfo}
        controlTime={controlData.controlTime || controlData.qrCodeGenerationTime}
        missions={missions}
        employments={employments}
        businesses={businesses}
        coworkers={coworkers}
        vehicles={vehicles}
        periodOnFocus={periodOnFocus}
        setPeriodOnFocus={setPeriodOnFocus}
        workingDaysNumber={workingDaysAnalysis.workingDaysNumber}
        daysAddedPosterioriNumber={workingDaysAnalysis.daysAddedPosterioriNumber}
        daysModifiedNumber={workingDaysAnalysis.daysModifiedNumber}
        allowC1BExport={false}
        controlId={controlData.id}
        companyName={controlData.companyName}
        companySiren={companySiren}
        vehicleRegistrationNumber={controlData.vehicleRegistrationNumber}
        controlData={controlData}
        regulationComputationsByDay={controlData.regulationComputationsByDay}
        openBulletinControl={() => setIsEditingBC(true)}
        reportedInfractionsLastUpdateTime={reportedInfractionsLastUpdateTime}
        isReportingInfractions={isReportingInfractions}
        setIsReportingInfractions={setIsReportingInfractions}
        readOnlyAlerts={false}
        groupedAlerts={groupedAlerts}
      />
      <ControlBulletinDrawer
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
    </>
  );
}
