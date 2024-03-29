import React from "react";
import Typography from "@mui/material/Typography";

import Container from "@mui/material/Container";
import { MissionDetails } from "./MissionDetails";
import { useLocation } from "react-router-dom";
import { useLoadingScreen } from "common/utils/loading";
import { prettyFormatDay } from "common/utils/time";
import { useApi } from "common/utils/api";
import { parseMissionPayloadFromBackend } from "common/utils/mission";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { formatApiError } from "common/utils/errors";
import { makeStyles } from "@mui/styles";
import { AccountButton } from "./AccountButton";
import { MISSION_QUERY } from "common/utils/apiQueries";
import { parseActivityPayloadFromBackend } from "common/utils/activities";
import { captureSentryException } from "common/utils/sentry";

const useStyles = makeStyles(theme => ({
  overview: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(4),
    textAlign: "left"
  },
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  }
}));

export default function EditPastMission({
  missions,
  createActivity,
  editActivityEvent,
  validateMission,
  editExpenditures,
  editVehicle,
  registerKilometerReading,
  logComment,
  cancelComment,
  openHistory
}) {
  const location = useLocation();
  const withLoadingScreen = useLoadingScreen();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const userId = store.userId();

  const [mission, setMission] = React.useState(null);
  const [day, setDay] = React.useState(null);
  const [error, setError] = React.useState(null);

  const classes = useStyles();

  React.useEffect(() => {
    withLoadingScreen(async () => {
      const queryString = new URLSearchParams(location.search);
      const missionId = queryString.get("mission");
      const day_ = location.state ? location.state.day : null;
      const dayTimestamp = (new Date(day_).getTime() / 1000) >> 0;
      if (dayTimestamp) setDay(dayTimestamp);
      let missionMatch;
      if (missionId) {
        missionMatch = missions.find(m => m.id.toString() === missionId);
        const submittedMissionId = parseInt(missionId);
        if (!missionMatch && submittedMissionId) {
          try {
            const missionResponse = await api.graphQlQuery(MISSION_QUERY, {
              id: submittedMissionId
            });
            const missionResponsePayload = missionResponse.data.mission;
            store.createEntityObject(
              parseMissionPayloadFromBackend(missionResponsePayload, userId),
              "missions"
            );
            store.createEntityObject(
              missionResponsePayload.activities.map(
                parseActivityPayloadFromBackend
              ),
              "activities"
            );
            store.createEntityObject(
              missionResponsePayload.expenditures,
              "expenditures"
            );
            store.createEntityObject(
              missionResponsePayload.comments,
              "comments"
            );
            store.batchUpdate();
            missionMatch = missionResponsePayload;
          } catch (err) {
            captureSentryException(err);
            setError(formatApiError(err));
          }
        }
      }
      if (missionMatch) setMission(missionMatch);
      else setError("lien invalide");
    });
  }, [location]);

  React.useEffect(() => {
    if (mission) {
      const missionMatch = missions.find(m => m.id === mission.id);
      if (missionMatch) setMission(missionMatch);
    }
  }, [missions]);

  if (error)
    return (
      <Container>
        <Typography align="center" key={0} color="error">
          Impossible d'accéder à la page : {error}
        </Typography>
      </Container>
    );

  if (!mission) return null;

  const actualDay =
    mission.activities.length > 0 ? mission.activities[0].startTime : day;

  return [
    <Container key={0} maxWidth={false} className={classes.overview}>
      <AccountButton darkBackground />
      <Typography variant="h1" align="left" className={classes.title}>
        {mission.name
          ? `Mission : ${mission.name}`
          : `Mission du ${prettyFormatDay(actualDay)}`}
      </Typography>
      {actualDay && !!mission.name && (
        <Typography align="left">{prettyFormatDay(actualDay)}</Typography>
      )}
    </Container>,
    <MissionDetails
      key={3}
      mission={mission}
      editActivityEvent={editActivityEvent}
      editExpenditures={editExpenditures}
      nullableEndTimeInEditActivity={false}
      logComment={logComment}
      cancelComment={cancelComment}
      hideValidations={mission.activities.length === 0}
      validateMission={async m => {
        await validateMission(m);
        if (parseInt(mission.id)) openHistory(mission.id);
      }}
      validationButtonName="Valider la mission"
      createActivity={createActivity}
      isMissionEnded={true}
      editKilometerReading={registerKilometerReading}
      editVehicle={vehicle => editVehicle({ mission, vehicle })}
      defaultTime={day}
      disableEmptyActivitiesPlaceHolder
      forceDisplayEndLocation
    />
  ];
}
