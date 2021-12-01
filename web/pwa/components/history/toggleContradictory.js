import React from "react";
import {
  getResourcesAndHistoryForMission,
  getVersionsOfResourcesAt,
  MISSION_RESOURCE_TYPES
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

  const [contradictoryIsEmpty, setContradictoryIsEmpty] = React.useState(false);

  const [
    isComputingContradictory,
    setIsComputingContradictory
  ] = React.useState(false);
  const [
    employeeMissionResourceVersions,
    setEmployeeMissionResourceVersions
  ] = React.useState([]);

  const [eventsHistory, setEventsHistory] = React.useState([]);

  async function computeContradictory() {
    setIsComputingContradictory(true);

    await alerts.withApiErrorHandling(
      async () => {
        const resourcesWithValidationTimeAndHistory = await Promise.all(
          missionsWithValidationTimes.map(async m => [
            ...m,
            await getResourcesAndHistoryForMission(m[0], api, cacheInStore)
          ])
        );
        const resourceChangesPerMission = resourcesWithValidationTimeAndHistory.map(
          mi => {
            const missionResourcesWithHistory = mi[2];
            return {
              employeeVersions: getVersionsOfResourcesAt(
                missionResourcesWithHistory.resources,
                mi[1]
              ),
              history: missionResourcesWithHistory.history,
              hasContradictoryChanges: missionResourcesWithHistory.history.some(
                change =>
                  change.resourceType !== MISSION_RESOURCE_TYPES.validation &&
                  change.time > mi[1]
              )
            };
          }
        );
        const allResourceVersionsAtEmployeeTime = flatMap(
          resourceChangesPerMission.map(x => x.employeeVersions)
        );
        setEmployeeMissionResourceVersions({
          activities: allResourceVersionsAtEmployeeTime.filter(
            ({ type }) => type === MISSION_RESOURCE_TYPES.activity
          ),
          expenditures: allResourceVersionsAtEmployeeTime.filter(
            ({ type }) => type === MISSION_RESOURCE_TYPES.expenditure
          )
        });
        setEventsHistory(
          flatMap(resourceChangesPerMission.map(x => x.history)).sort(
            (c1, c2) => c1.time - c2.time
          )
        );
        setHasComputedContradictory(true);
        setContradictoryIsEmpty(
          resourceChangesPerMission.every(x => !x.hasContradictoryChanges)
        );
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
    setEmployeeMissionResourceVersions([]);
  }, [missionsWithValidationTimes.map(m => m[0].id).reduce((a, b) => a + b)]);

  return [
    shouldDisplayInitialEmployeeVersion
      ? employeeMissionResourceVersions
      : missionsWithValidationTimes.reduce(
          (acc, m) => {
            acc.activities.push(...(m[0].allActivities || m[0].activities));
            acc.expenditures.push(...(m[0].expenditures || []));
            return acc;
          },
          { activities: [], expenditures: [] }
        ),
    eventsHistory,
    isComputingContradictory,
    hasComputedContradictory,
    contradictoryIsEmpty
  ];
}
