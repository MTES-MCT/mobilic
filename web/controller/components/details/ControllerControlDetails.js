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
import orderBy from "lodash/orderBy";

export function ControllerControlDetails({ controlId, onClose }) {
  const [controlData, setControlData] = React.useState({});
  const [alertNumber, setAlertNumber] = React.useState(0);
  const [groupedAlerts, setGroupedAlerts] = React.useState([]);
  const [employments, setEmployments] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [coworkers, setCoworkers] = React.useState([]);

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
          const _controlData = apiResponse.data.controlData;
          setControlData(_controlData);

          setEmployments(orderEmployments(_controlData.employments));
          const _vehicles = {};
          _controlData.employments.forEach(e => {
            e.company.vehicles.forEach(v => {
              _vehicles[v.id.toString()] = v;
            });
          });
          setVehicles(_vehicles);
          const _missions = augmentAndSortMissions(
            _controlData.missions.map(m => ({
              ...m,
              ...parseMissionPayloadFromBackend(m, _controlData.user.id),
              allActivities: orderBy(m.activities, ["startTime", "endTime"])
            })),
            _controlData.user.id
          ).filter(m => m.activities.length > 0);
          setMissions(_missions);
          setGroupedAlerts(
            computeAlerts(
              _missions,
              jsToUnixTimestamp(
                new Date(_controlData.historyStartDate).getTime()
              ),
              _controlData.qrCodeGenerationTime
            )
          );
          const _coworkers = {};
          _controlData.missions.forEach(m => {
            m.activities.forEach(a => {
              _coworkers[a.user.id.toString()] = a.user;
            });
          });
          setCoworkers(_coworkers);
        });
      });
    }
  }, [controlId]);

  React.useEffect(() => {
    setAlertNumber(
      groupedAlerts.reduce((acc, group) => acc + group.alerts.length, 0)
    );
  }, [groupedAlerts]);

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
      groupedAlerts={groupedAlerts}
      alertNumber={alertNumber}
      userInfo={controlData.user}
      tokenInfo={legacyTokenInfo}
      controlTime={controlData.qrCodeGenerationTime}
      missions={missions}
      employments={employments}
      coworkers={coworkers}
      vehicles={vehicles}
      workingDaysNumber={controlData.nbControlledDays || 0}
      allowC1BExport={false}
      controlId={controlId}
      companyName={controlData.companyName}
      vehicleRegistrationNumber={controlData.vehicleRegistrationNumber}
    />
  ];
}
