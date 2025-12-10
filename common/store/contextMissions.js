import React from "react";
import { useStoreSyncedWithLocalStorage } from "./store";
import { sortActivities } from "../utils/activities";
import { sortEvents } from "../utils/events";
import values from "lodash/values";
import {
  augmentAndSortMissions,
  linkMissionsWithRelations
} from "../utils/mission";
const StoreMissionsContext = React.createContext(() => {});

export function StoreMissionsContextProvider({ children }) {
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

  const missions = unfilteredMissions.filter((m) => m.activities.length > 0);
  const notDeletedMissions = missions.filter((m) => !m.deletedAt);

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

  const contextValue = React.useMemo(
    () => ({
      unfilteredMissions,
      missions,
      latestActivity,
      currentMission,
      previousMissionEnd,
      displayCurrentMission
    }),
    [
      unfilteredMissions,
      missions,
      latestActivity,
      currentMission,
      previousMissionEnd,
      displayCurrentMission
    ]
  );

  return (
    <StoreMissionsContext.Provider value={contextValue}>
      {children}
    </StoreMissionsContext.Provider>
  );
}

export const useStoreMissions = () => React.useContext(StoreMissionsContext);
