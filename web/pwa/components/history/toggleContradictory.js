import React from "react";
import {
  getChangesHistory,
  getContradictoryInfoForMission,
  getEventChangesSinceTime,
  getPreviousVersionsOfEvents
} from "common/utils/contradictory";
import flatMap from "lodash/flatMap";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useSnackbarAlerts } from "../../../common/Snackbar";

export function useToggleContradictory(
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion,
  missions
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

  const [changesHistory, setChangesHistory] = React.useState([]);

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
        const activitiesChangesPerMission = contradictoryInfo.map(ci => {
          const mission = ci[0];
          const missionActivitiesWithHistory = ci[1].activities;
          const eventChanges = getEventChangesSinceTime(
            missionActivitiesWithHistory,
            mission.validation.receptionTime
          );
          return [
            getPreviousVersionsOfEvents(eventChanges),
            getChangesHistory(eventChanges)
          ];
        });
        setEmployeeActivityVersions(
          flatMap(activitiesChangesPerMission.map(x => x[0]))
        );
        setChangesHistory(
          flatMap(activitiesChangesPerMission.map(x => x[1])).sort(
            (c1, c2) => c1.time - c2.time
          )
        );
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
    shouldDisplayInitialEmployeeVersion
      ? employeeActivityVersions
      : flatMap(missions, m => m.allActivities || m.activities),
    changesHistory,
    loadingEmployeeVersion
  ];
}
