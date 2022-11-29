import { UserReadTabs } from "../../../control/components/UserReadTabs";
import React from "react";
import { getTabs } from "../../../control/UserRead";
import { CONTROLLER_READ_CONTROL_DATA } from "common/utils/apiQueries";
import {
  augmentAndSortMissions,
  parseMissionPayloadFromBackend
} from "common/utils/mission";
import { jsToUnixTimestamp, unixToJSTimestamp } from "common/utils/time";
import { computeAlerts } from "common/utils/regulation/computeAlerts";
import { orderEmployments } from "common/utils/employments";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { ControllerControlHeader } from "./ControllerControlHeader";
import _ from "lodash";
import { computeNumberOfAlerts } from "common/utils/regulation/computeNumberOfAlerts";

export function ControllerControlDetails({ controlId, onClose }) {
  const [controlData, setControlData] = React.useState({});
  const [groupedAlerts, setGroupedAlerts] = React.useState([]);
  const [employments, setEmployments] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [coworkers, setCoworkers] = React.useState([]);
  const [periodOnFocus, setPeriodOnFocus] = React.useState(null);

  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  // Keep this Object to Reuse existing tabs. To adapt when unauthenticated control will be removed
  const legacyTokenInfo = {
    creationDay: new Date(unixToJSTimestamp(controlData.qrCodeGenerationTime)),
    historyStartDay: controlData.historyStartDate,
    creationTime: controlData.creationTime
  };

  React.useEffect(() => {
    if (controlId) {
      withLoadingScreen(async () => {
        await alerts.withApiErrorHandling(async () => {
          const apiResponse = await api.graphQlMutate(
            CONTROLLER_READ_CONTROL_DATA,
            { controlId },
            { context: { nonPublicApi: true } }
          );
          setControlData(apiResponse.data.controlData);
        });
      });
    }
  }, [controlId]);

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

      const _groupedAlerts = computeAlerts(
        _missions,
        jsToUnixTimestamp(new Date(controlData.historyStartDate).getTime()),
        controlData.qrCodeGenerationTime
      );
      setGroupedAlerts(_groupedAlerts);
    } else {
      setMissions([]);
      setCoworkers([]);
      setGroupedAlerts([]);
    }
  }, [controlData]);

  const alertNumber = React.useMemo(() => {
    if (!controlData || !controlData.regulationComputationsByDay) {
      return 0;
    }
    return computeNumberOfAlerts(controlData.regulationComputationsByDay);
  }, [controlData]);

  return [
    <ControllerControlHeader
      key={0}
      controlId={controlId}
      controlDate={legacyTokenInfo?.creationTime}
      onCloseDrawer={onClose}
    />,
    <UserReadTabs
      key={1}
      tabs={getTabs(alertNumber)}
      regulationComputationsByDay={controlData.regulationComputationsByDay}
      groupedAlerts={groupedAlerts} // TODO to remove <<<
      alertNumber={alertNumber}
      userInfo={controlData.user}
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
      controlId={controlId}
      companyName={controlData.companyName}
      vehicleRegistrationNumber={controlData.vehicleRegistrationNumber}
    />
  ];
}
