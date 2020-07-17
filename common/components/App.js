import React from "react";
import values from "lodash/values";
import { sortEvents } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useActions } from "common/utils/actions";
import {
  computeMissionProperties,
  linkMissionsWithRelations
} from "../utils/mission";
import { getTime } from "../utils/events";

function App({ ScreenComponent, loadUser }) {
  const actions = useActions();
  const store = useStoreSyncedWithLocalStorage();

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(Date.now()), 30000);
  }, []);

  const activities = sortEvents(values(store.getEntity("activities")));
  const expenditures = values(store.getEntity("expenditures"));

  const unsortedMissions = linkMissionsWithRelations(
    store.getEntity("missions"),
    {
      activities: activities.filter(a => a.userId === store.userId()),
      allActivities: activities,
      expenditures: expenditures.filter(e => e.userId === store.userId())
    }
  )
    .map(m => ({ ...m, ...computeMissionProperties(m) }))
    .filter(m => m.activities.length > 0);

  const missions = sortEvents(unsortedMissions);

  const currentMission =
    missions.length > 0 ? missions[missions.length - 1] : null;

  const previousMission =
    missions.length > 1 ? missions[missions.length - 2] : null;
  const previousMissionEnd = previousMission
    ? getTime(previousMission.activities[previousMission.activities.length - 1])
    : 0;

  const currentActivity =
    currentMission && currentMission.activities.length > 0
      ? currentMission.activities[currentMission.activities.length - 1]
      : null;

  return (
    <ScreenComponent
      currentTime={currentTime}
      missions={missions}
      currentActivity={currentActivity}
      currentMission={currentMission}
      pushNewTeamActivityEvent={actions.pushNewTeamActivityEvent}
      editActivityEvent={actions.editActivityEvent}
      beginNewMission={actions.beginNewMission}
      endMissionForTeam={actions.endMissionForTeam}
      endMission={actions.endMission}
      validateMission={actions.validateMission}
      logExpenditureForTeam={actions.logExpenditureForTeam}
      cancelExpenditure={actions.cancelExpenditure}
      editExpendituresForTeam={actions.editExpendituresForTeam}
      previousMissionEnd={previousMissionEnd}
      loadUser={loadUser}
    />
  );
}

export default App;
