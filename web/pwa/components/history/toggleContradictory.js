import React from "react";
import {
  getContradictoryInfoForMission,
  getEventVersionsAtTime
} from "common/utils/contradictory";
import flatMap from "lodash/flatMap";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useSnackbarAlerts } from "../../../common/Snackbar";

export function useToggleContradictory(
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion,
  missions,
  activities
) {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const [loadingEmployeeVersion, setLoadingEmployeeVersion] = React.useState(
    false
  );
  const [
    employeeActivityVersions,
    setEmployeeActivityVersions
  ] = React.useState([]);

  async function switchToEmployeeVersion() {
    setLoadingEmployeeVersion(true);

    await alerts.withApiErrorHandling(
      async () => {
        const contradictoryInfo = await Promise.all(
          missions.map(async m => [
            m,
            await getContradictoryInfoForMission(m, api, store)
          ])
        );
        const employeeActivityVersionsOnDayMissions = flatMap(
          contradictoryInfo,
          ci => {
            const mission = ci[0];
            const missionActivitiesWithHistory = ci[1].activities;
            return getEventVersionsAtTime(
              activities.filter(a => a.missionId === mission.id),
              missionActivitiesWithHistory,
              mission.validation.receptionTime
            );
          }
        );
        const employeeActivityVersions = [
          ...employeeActivityVersionsOnDayMissions,
          ...activities.filter(
            a => !missions.map(m => m.id).includes(a.missionId)
          )
        ];
        setEmployeeActivityVersions(employeeActivityVersions);
      },
      "fetch-contradictory",
      null,
      () => setShouldDisplayInitialEmployeeVersion(false)
    );
    setLoadingEmployeeVersion(false);
  }

  React.useEffect(() => {
    if (
      shouldDisplayInitialEmployeeVersion &&
      employeeActivityVersions.length === 0
    ) {
      switchToEmployeeVersion();
    }
  }, [shouldDisplayInitialEmployeeVersion]);

  React.useEffect(() => {
    setShouldDisplayInitialEmployeeVersion(false);
    setEmployeeActivityVersions([]);
  }, [missions.map(m => m.id).reduce((a, b) => a + b)]);

  return [
    shouldDisplayInitialEmployeeVersion ? employeeActivityVersions : activities,
    loadingEmployeeVersion
  ];
}
