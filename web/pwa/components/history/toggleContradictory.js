import React from "react";
import {
  getResourcesAndHistoryForMission,
  getVersionsOfResourcesAt,
  MISSION_RESOURCE_TYPES,
  orderLogEvents
} from "common/utils/contradictory";
import flatMap from "lodash/flatMap";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";

export function useToggleContradictory(
  shouldCompute,
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion,
  missionsWithValidationTimes,
  cacheInStore,
  controlId = null
) {
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [
    hasComputedContradictory,
    setHasComputedContradictory
  ] = React.useState(false);

  const [
    contradictoryComputationError,
    setContradictoryComputationError
  ] = React.useState(null);
  const [contradictoryIsEmpty, setContradictoryIsEmpty] = React.useState(false);

  const [
    isComputingContradictory,
    setIsComputingContradictory
  ] = React.useState(false);
  const [
    employeeMissionResourceVersions,
    setEmployeeMissionResourceVersions
  ] = React.useState({});

  const [eventsHistory, setEventsHistory] = React.useState([]);

  async function computeContradictory() {
    setIsComputingContradictory(true);
    setContradictoryComputationError(null);

    await alerts.withApiErrorHandling(
      async () => {
        await api.executePendingRequests();
        const resourcesWithValidationTimeAndHistory = await Promise.all(
          missionsWithValidationTimes.map(async m => [
            ...m,
            await getResourcesAndHistoryForMission(
              m[0],
              api,
              cacheInStore,
              controlId
            )
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
          activities: allResourceVersionsAtEmployeeTime
            .filter(({ type }) => type === MISSION_RESOURCE_TYPES.activity)
            .map(r => r.resource),
          expenditures: allResourceVersionsAtEmployeeTime
            .filter(({ type }) => type === MISSION_RESOURCE_TYPES.expenditure)
            .map(r => r.resource)
        });
        setEventsHistory(
          flatMap(resourceChangesPerMission.map(x => x.history)).sort(
            orderLogEvents
          )
        );
        setHasComputedContradictory(true);
        setContradictoryIsEmpty(
          resourceChangesPerMission.every(x => !x.hasContradictoryChanges)
        );
      },
      "fetch-contradictory",
      null,
      error => {
        setContradictoryComputationError(error);
        setShouldDisplayInitialEmployeeVersion(false);
      },
      true
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
    setEmployeeMissionResourceVersions({});
  }, [missionsWithValidationTimes.map(m => m[0].id).reduce((a, b) => a + b)]);

  return {
    employeeVersion: employeeMissionResourceVersions,
    adminVersion: missionsWithValidationTimes.reduce(
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
    contradictoryIsEmpty,
    contradictoryComputationError
  };
}
