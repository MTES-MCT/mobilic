import React from "react";
import values from "lodash/values";
import { sortEvents } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { ActionsContextProvider, useActions } from "common/utils/actions";
import {
  augmentSortAndFilterMissions,
  linkMissionsWithRelations
} from "../utils/mission";
import { History } from "../../web/pwa/screens/History";
import { DAY, getStartOfMonth, now } from "../utils/time";
import { Switch, Route, useRouteMatch, useHistory } from "react-router-dom";
import { useApi } from "../utils/api";

function _App({ ScreenComponent, loadUser }) {
  const { path } = useRouteMatch();
  const history = useHistory();

  const actions = useActions();
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();

  React.useEffect(() => {
    if (!document.hidden) api.executePendingRequests();
  }, []);

  const activities = sortEvents(values(store.getEntity("activities")));
  const expenditures = values(store.getEntity("expenditures"));
  const comments = sortEvents(values(store.getEntity("comments")));

  const missions = augmentSortAndFilterMissions(
    linkMissionsWithRelations(store.getEntity("missions"), {
      allActivities: activities,
      expenditures: expenditures,
      comments: comments
    }),
    store.userId(),
    store.companies()
  );

  const historyStart = getStartOfMonth(now() - 183 * DAY);

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
    <Switch>
      <Route path={`${path}/history`}>
        <History
          handleBack={() => history.push(path)}
          missions={missions.filter(
            m => m.isComplete && m.ended && m.startTime >= historyStart
          )}
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
      </Route>
      <Route path={path}>
        <ScreenComponent
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
          openHistory={(missionId = null, state = null) =>
            history.push(
              `${path}/history${missionId ? "?mission=" + missionId : ""}`,
              state
            )
          }
        />
      </Route>
    </Switch>
  );
}

function App(props) {
  return (
    <ActionsContextProvider>
      <_App {...props} />
    </ActionsContextProvider>
  );
}

export default App;
