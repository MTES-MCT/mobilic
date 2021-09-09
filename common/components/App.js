import React from "react";
import values from "lodash/values";
import { sortEvents } from "common/utils/events";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { ActionsContextProvider, useActions } from "common/utils/actions";
import {
  augmentAndSortMissions,
  linkMissionsWithRelations
} from "../utils/mission";
import { History } from "../../web/pwa/screens/History";
import { Switch, Route, useRouteMatch, useHistory } from "react-router-dom";
import { useApi } from "../utils/api";
import EditPastMission from "../../web/pwa/components/EditPastMission";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";

const useStyles = makeStyles(theme => ({
  appContainer: {
    width: "100%",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column"
  }
}));

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

  const classes = useStyles();

  function openHistory(missionId = null, state = null) {
    history.push(
      `${path}/history${missionId ? "?mission=" + missionId : ""}`,
      state
    );
  }

  return (
    <Container className={classes.appContainer} maxWidth="md" disableGutters>
      <Switch>
        <Route path={`${path}/history`}>
          <History
            handleBack={() => history.push(path)}
            missions={missions.filter(m => m.isComplete && m.ended)}
            createActivity={args =>
              actions.pushNewTeamActivityEvent({ ...args, switchMode: false })
            }
            createMission={actions.beginNewMission}
            editExpenditures={actions.editExpendituresForTeam}
            editActivityEvent={actions.editActivityEvent}
            editVehicle={actions.updateMissionVehicle}
            currentMission={currentMission}
            validateMission={actions.validateMission}
            logComment={actions.logComment}
            cancelComment={actions.cancelComment}
            registerKilometerReading={actions.registerKilometerReading}
          />
        </Route>
        <Route path={`${path}/edit_mission`}>
          <EditPastMission
            missions={unfilteredMissions}
            createActivity={args =>
              actions.pushNewTeamActivityEvent({ ...args, switchMode: false })
            }
            editActivityEvent={actions.editActivityEvent}
            editVehicle={actions.updateMissionVehicle}
            validateMission={actions.validateMission}
            editExpenditures={actions.editExpendituresForTeam}
            registerKilometerReading={actions.registerKilometerReading}
            logComment={actions.logComment}
            cancelComment={actions.cancelComment}
            endMission={actions.endMission}
            openHistory={openHistory}
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
            openEndMissionModal={actions.openEndMissionModal}
            validateMission={actions.validateMission}
            editVehicle={actions.updateMissionVehicle}
            logExpenditureForTeam={actions.logExpenditureForTeam}
            cancelExpenditure={actions.cancelExpenditure}
            editExpendituresForTeam={actions.editExpendituresForTeam}
            updateMissionVehicle={actions.updateMissionVehicle}
            registerKilometerReading={actions.registerKilometerReading}
            logComment={actions.logComment}
            cancelComment={actions.cancelComment}
            previousMissionEnd={previousMissionEnd}
            loadUser={loadUser}
            openHistory={openHistory}
          />
        </Route>
      </Switch>
    </Container>
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
