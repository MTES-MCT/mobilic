import React from "react";
import values from "lodash/values";
import { sortEvents } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { useActions } from "common/utils/actions";
import {
  computeMissionProperties,
  linkMissionsWithRelations
} from "../utils/mission";

function App({ ScreenComponent }) {
  const actions = useActions();
  const store = useStoreSyncedWithLocalStorage();

  const [currentTime, setCurrentTime] = React.useState(Date.now());

  // We force re-rendering every 5 sec to update timers
  React.useEffect(() => {
    setInterval(() => setCurrentTime(Date.now()), 30000);
  }, []);

  const activities = sortEvents(values(store.getEntity("activities")));
  const vehicleBookings = sortEvents(
    values(store.getEntity("vehicleBookings"))
  );
  const teamChanges = sortEvents(values(store.getEntity("teamChanges")));

  const unsortedMissions = linkMissionsWithRelations(
    store.getEntity("missions"),
    {
      activities,
      vehicleBookings,
      teamChanges
    }
  ).map(m => ({ ...m, ...computeMissionProperties(m) }));

  const missions = sortEvents(unsortedMissions);

  const currentMission =
    missions.length > 0 ? missions[missions.length - 1] : null;

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
      pushNewActivityEvent={actions.pushNewActivityEvent}
      editActivityEvent={actions.editActivityEvent}
      pushNewTeamEnrollmentOrRelease={actions.pushNewTeamEnrollmentOrRelease}
      beginNewMission={actions.beginNewMission}
      pushNewVehicleBooking={actions.pushNewVehicleBooking}
      pushNewComment={actions.pushNewComment}
      endMission={actions.endMission}
      validateMission={actions.validateMission}
      editMissionExpenditures={actions.editMissionExpenditures}
    />
  );
}

export default App;
