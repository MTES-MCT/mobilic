import React from "react";
import {
  getChangesHistory,
  getContradictoryInfoForMission,
  getEventChangesSinceTime,
  getPreviousVersionsOfEvents
} from "common/utils/contradictory";
import flatMap from "lodash/flatMap";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";

export function useToggleContradictory(
  shouldCompute,
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion,
  missionsWithValidationTimes,
  cacheInStore
) {
  const api = useApi();
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
          missionsWithValidationTimes.map(async m => [
            ...m,
            await getContradictoryInfoForMission(m[0], api, cacheInStore)
          ])
        );
        const activitiesChangesPerMission = contradictoryInfo.map(ci => {
          const missionActivitiesWithHistory = ci[2].activities;
          const eventChanges = getEventChangesSinceTime(
            missionActivitiesWithHistory,
            ci[1]
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
  }, [missionsWithValidationTimes.map(m => m[0].id).reduce((a, b) => a + b)]);

  return [
    shouldDisplayInitialEmployeeVersion
      ? employeeActivityVersions
      : flatMap(
          missionsWithValidationTimes,
          m => m[0].allActivities || m[0].activities
        ),
    changesHistory,
    isComputingContradictory,
    hasComputedContradictory
  ];
}
