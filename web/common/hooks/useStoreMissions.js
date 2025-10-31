import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { sortActivities } from "common/utils/activities";
import { sortEvents } from "common/utils/events";
import {
  augmentAndSortMissions,
  linkMissionsWithRelations
} from "common/utils/mission";
import { values } from "lodash";

export const useStoreMissions = () => {
  const store = useStoreSyncedWithLocalStorage();

  const activities = sortActivities(values(store.getEntity("activities")));
  const expenditures = values(store.getEntity("expenditures"));
  const comments = sortEvents(values(store.getEntity("comments")));

  const unfilteredMissions = augmentAndSortMissions(
    linkMissionsWithRelations(store.getEntity("missions"), {
      allActivities: activities,
      expenditures: expenditures,
      comments: comments
    }),
    store.userId(),
    store.companies()
  );

  const missions = unfilteredMissions.filter(m => m.activities.length > 0);
  const notDeletedMissions = missions.filter(m => !m.deletedAt);

  const currentMission =
    notDeletedMissions.length > 0
      ? notDeletedMissions[notDeletedMissions.length - 1]
      : null;

  const previousMission =
    notDeletedMissions.length > 1
      ? notDeletedMissions[notDeletedMissions.length - 2]
      : null;
  const previousMissionEnd = previousMission
    ? previousMission.activities[previousMission.activities.length - 1].endTime
    : 0;

  const latestActivity =
    currentMission && currentMission.activities.length > 0
      ? currentMission.activities[currentMission.activities.length - 1]
      : null;

  const displayCurrentMission = React.useMemo(
    () =>
      !(
        !latestActivity ||
        !currentMission ||
        currentMission.isDeleted ||
        currentMission.adminValidation ||
        (currentMission.validation &&
          currentMission.ended &&
          latestActivity.endTime)
      ),
    [latestActivity, currentMission]
  );

  return {
    unfilteredMissions,
    missions,
    latestActivity,
    currentMission,
    previousMissionEnd,
    displayCurrentMission
  };
};
