import React from "react";
import {
  getChangesHistory,
  getContradictoryInfoForMission,
  getEventChangesSinceTime,
  getPreviousVersionsOfEvents
} from "common/utils/contradictory";
import flatMap from "lodash/flatMap";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useSnackbarAlerts } from "../../../common/Snackbar";

export function useToggleContradictory(
  shouldCompute,
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion,
  missions
) {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const [
    hasComputedContradictory,
    setHasComputedContradictory
  ] = React.useState(false);
  const [
    isComputingContradictory,
    setIsComputingContradictory
  ] = React.useState(false);
  const [
    employeeActivityVersions,
    setEmployeeActivityVersions
  ] = React.useState([]);

  const [changesHistory, setChangesHistory] = React.useState([]);

  async function computeContradictory() {
    setIsComputingContradictory(true);

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
        setHasComputedContradictory(true);
      },
      "fetch-contradictory",
      null,
      () => setShouldDisplayInitialEmployeeVersion(false)
    );
    setIsComputingContradictory(false);
  }

  React.useEffect(() => {
    if (
      !hasComputedContradictory &&
      !isComputingContradictory &&
      shouldCompute
    ) {
      computeContradictory();
    }
  }, [hasComputedContradictory, shouldCompute]);

  React.useEffect(() => {
    setShouldDisplayInitialEmployeeVersion(false);
    setHasComputedContradictory(false);
    setEmployeeActivityVersions([]);
  }, [missions.map(m => m.id).reduce((a, b) => a + b)]);

  return [
    shouldDisplayInitialEmployeeVersion
      ? employeeActivityVersions
      : flatMap(missions, m => m.allActivities || m.activities),
    changesHistory,
    isComputingContradictory,
    hasComputedContradictory
  ];
}
