import React from "react";
import values from "lodash/values";
import { sortEvents } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useActions } from "common/utils/actions";
import {
  computeMissionProperties,
  linkMissionsWithRelations
} from "../utils/mission";
import { HistoryModal } from "../../web/pwa/screens/History";
import { now } from "../utils/time";

function App({ ScreenComponent, loadUser }) {
  const actions = useActions();
  const store = useStoreSyncedWithLocalStorage();

  const [openHistory, setOpenHistory] = React.useState(false);

  const [currentTime, setCurrentTime] = React.useState(now());

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(now()), 30000);
  }, []);

  const activities = sortEvents(values(store.getEntity("activities")));
  const expenditures = values(store.getEntity("expenditures"));
  const comments = sortEvents(values(store.getEntity("comments")));

  const unsortedMissions = linkMissionsWithRelations(
    store.getEntity("missions"),
    {
      activities: activities.filter(a => a.userId === store.userId()),
      allActivities: activities,
      expenditures: expenditures.filter(e => e.userId === store.userId()),
      comments: comments
    }
  )
    .map(m => ({ ...m, ...computeMissionProperties(m, store.userId()) }))
    .filter(m => m.activities.length > 0);

  const missions = sortEvents(unsortedMissions);

  const currentMission =
    missions.length > 0 ? missions[missions.length - 1] : null;

  const previousMission =
    missions.length > 1 ? missions[missions.length - 2] : null;
  const previousMissionEnd = previousMission
    ? previousMission.activities[previousMission.activities.length - 1].endTime
    : 0;

  const latestActivity =
    currentMission && currentMission.activities.length > 0
      ? currentMission.activities[currentMission.activities.length - 1]
      : null;

  return (
    <>
      <ScreenComponent
        currentTime={currentTime}
        missions={missions}
        latestActivity={latestActivity}
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
        logComment={actions.logComment}
        cancelComment={actions.cancelComment}
        previousMissionEnd={previousMissionEnd}
        loadUser={loadUser}
        openHistory={() => setOpenHistory(true)}
      />
      <HistoryModal
        open={openHistory}
        handleClose={() => setOpenHistory(false)}
        missions={missions.filter(m => m.isComplete)}
        createActivity={args =>
          actions.pushNewTeamActivityEvent({ ...args, switchMode: false })
        }
        editExpenditures={actions.editExpendituresForTeam}
        editActivityEvent={actions.editActivityEvent}
        currentMission={currentMission}
        validateMission={actions.validateMission}
        logComment={actions.logComment}
        cancelComment={actions.cancelComment}
      />
    </>
  );
}

export default App;
