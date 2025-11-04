import React from "react";
import values from "lodash/values";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { ActionsContextProvider, useActions } from "common/utils/actions";
import { History } from "../../web/pwa/screens/History";
import { Switch, Route, useRouteMatch, useHistory } from "react-router-dom";
import { useApi } from "../utils/api";
import EditPastMission from "../../web/pwa/components/EditPastMission";
import { makeStyles } from "@mui/styles";
import { Main } from "../../web/common/semantics/Main";
import { useStoreMissions } from "../../web/common/hooks/useStoreMissions";

const useStyles = makeStyles(theme => ({
  appContainer: {
    width: "100%",
    flexGrow: 1,
    display: "flex",
    flexDirection: "column"
  }
}));

function AppComponent({ ScreenComponent }) {
  const { path } = useRouteMatch();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();

  const actions = useActions();
  const api = useApi();

  React.useEffect(() => {
    if (!document.hidden) api.executePendingRequests();
  }, []);

  const regulationComputationsByDay = values(
    store.getEntity("regulationComputationsByDay")
  );

  const {
    unfilteredMissions,
    missions,
    latestActivity,
    currentMission,
    previousMissionEnd
  } = useStoreMissions();

  const classes = useStyles();

  function openHistory(missionId = null, state = null) {
    history.push(
      `${path}/history${missionId ? "?mission=" + missionId : ""}`,
      state
    );
  }

  return (
    <Main className={classes.appContainer} maxWidth="md" disableGutters>
      <Switch>
        <Route path={`${path}/history`}>
          <History
            handleBack={() => history.push(path)}
            missions={missions}
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
            regulationComputationsByDay={regulationComputationsByDay}
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
            loadUser={() => {}} // TODO: Implémenter si nécessaire
            openHistory={openHistory}
          />
        </Route>
      </Switch>
    </Main>
  );
}

function App(props) {
  return (
    <ActionsContextProvider>
      <AppComponent {...props} />
    </ActionsContextProvider>
  );
}

export default App;
