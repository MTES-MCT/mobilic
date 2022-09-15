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
  const [tabs, setTabs] = React.useState(getTabs(0));
  const [alertNumber, setAlertNumber] = React.useState(0);
  const [groupedAlerts, setGroupedAlerts] = React.useState([]);
  const [userInfo, setUserInfo] = React.useState({});
  const [employments, setEmployments] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [nbWorkingDays, setNbWorkingDays] = React.useState(0);
  const [coworkers, setCoworkers] = React.useState([]);
  const [qrCodeGenerationTime, setQrCodeGenerationTime] = React.useState([]);
  const [periodOnFocus, setPeriodOnFocus] = React.useState(null);
  const [legacyTokenInfo, setLegacyTokenInfo] = React.useState({});

  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  React.useEffect(() => {
    const nbAlerts = groupedAlerts.reduce(
      (acc, group) => acc + group.alerts.length,
      0
    );
    setAlertNumber(nbAlerts);
    setTabs(getTabs(nbAlerts));
  }, [groupedAlerts]);

  React.useEffect(() => {
    if (controlId) {
      withLoadingScreen(async () => {
        await alerts.withApiErrorHandling(async () => {
          const apiResponse = await api.graphQlMutate(
            CONTROLLER_READ_CONTROL_DATA,
            { controlId },
            { context: { nonPublicApi: true } }
          );
          const controlData = apiResponse.data.controlData;
          setUserInfo({
            id: controlData.user.id,
            firstName: controlData.user.firstName,
            lastName: controlData.user.lastName,
            birthDate: controlData.user.birthDate,
            email: controlData.user.email
          });
          setEmployments(orderEmployments(controlData.employments));
          const _vehicles = {};
          controlData.employments.forEach(e => {
            e.company.vehicles.forEach(v => {
              _vehicles[v.id.toString()] = v;
            });
          });
          setVehicles(_vehicles);
          const missions_ = augmentAndSortMissions(
            controlData.missions.map(m => ({
              ...m,
              ...parseMissionPayloadFromBackend(m, controlData.user.id),
              allActivities: orderBy(m.activities, ["startTime", "endTime"])
            })),
            controlData.user.id
          ).filter(m => m.activities.length > 0);
          setMissions(missions_);
          setNbWorkingDays(controlData.nbControlledDays || 0);
          setGroupedAlerts(
            computeAlerts(
              missions_,
              jsToUnixTimestamp(
                new Date(controlData.historyStartDate).getTime()
              ),
              controlData.qrCodeGenerationTime
            )
          );
          const _coworkers = {};
          controlData.missions.forEach(m => {
            m.activities.forEach(a => {
              _coworkers[a.user.id.toString()] = a.user;
            });
          });
          setCoworkers(_coworkers);
          setQrCodeGenerationTime(controlData.qrCodeGenerationTime);

          // Keep this Object to Reuse existing tabs. To adapt when unauthenticated control will be removed
          setLegacyTokenInfo({
            creationDay: new Date(
              unixToJSTimestamp(controlData.qrCodeGenerationTime)
            ),
            historyStartDay: controlData.historyStartDate,
            creationTime: controlData.creationTime
          });
        });
      });
    }
  }, [controlId]);

  return [
    <ControllerControlHeader
      key={0}
      controlId={controlId}
      controlDate={legacyTokenInfo?.creationTime}
      onCloseDrawer={onClose}
    />,
    <UserReadTabs
      key={1}
      tabs={tabs}
      groupedAlerts={groupedAlerts}
      alertNumber={alertNumber}
      userInfo={userInfo}
      tokenInfo={legacyTokenInfo}
      controlTime={qrCodeGenerationTime}
      missions={missions}
      employments={employments}
      coworkers={coworkers}
      vehicles={vehicles}
      periodOnFocus={periodOnFocus}
      setPeriodOnFocus={setPeriodOnFocus}
      workingDaysNumber={nbWorkingDays}
      allowC1BExport={false}
      controlId={controlId}
    />
  ];
}
