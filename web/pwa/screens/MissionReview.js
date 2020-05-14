import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { resolveTeamAt } from "common/utils/coworkers";
import { getTime } from "common/utils/events";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { MainCtaButton } from "../components/MainCtaButton";
import { formatGraphQLError } from "common/utils/errors";
import {
  computeDayKpis,
  WorkTimeSummaryKpiGrid
} from "../components/WorkTimeSummary";
import { AccountButton } from "../components/AccountButton";
import { prettyFormatDay } from "common/utils/time";
import { MissionDetails } from "../components/MissionDetails";

const useStyles = makeStyles(theme => ({
  overviewTimersContainer: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  overviewTimersTitle: {
    paddingBottom: theme.spacing(2)
  },
  backgroundPaper: {
    backgroundColor: theme.palette.background.paper
  }
}));

export function MissionReview({
  currentMission,
  currentMissionActivities,
  pushNewActivityEvent,
  editActivityEvent,
  validateMission,
  editMissionExpenditures
}) {
  const [submissionError, setSubmissionError] = React.useState(null);
  const store = useStoreSyncedWithLocalStorage();

  const dayMetrics = computeDayKpis(currentMissionActivities);
  const team = resolveTeamAt(
    store,
    getTime(currentMissionActivities[currentMissionActivities.length - 1])
  );

  const classes = useStyles();
  return (
    <Container
      style={{ flexGrow: 1 }}
      className="flex-column scrollable"
      disableGutters
    >
      <Box p={2} pt={2} pb={4} className={classes.overviewTimersContainer}>
        <AccountButton pb={4} darkBackground />
        <Typography
          className={classes.overviewTimersTitle}
          align="left"
          variant="h5"
        >
          Récapitulatif de la mission
          {` ${
            currentMission.name ? currentMission.name : ""
          } du ${prettyFormatDay(getTime(currentMissionActivities[0]))}`}
        </Typography>
        <WorkTimeSummaryKpiGrid metrics={dayMetrics} />
      </Box>
      <MissionDetails
        mission={currentMission}
        missionActivities={currentMissionActivities}
        team={team}
        editActivityEvent={editActivityEvent}
        editExpenditures={editMissionExpenditures}
        previousMissionEnd={0}
        createActivity={pushNewActivityEvent}
      />
      {validateMission && (
        <Box
          pt={4}
          className={`cta-container unshrinkable ${classes.backgroundPaper}`}
          pb={submissionError ? 2 : 4}
        >
          <MainCtaButton
            onClick={async () => {
              try {
                await validateMission(currentMission);
              } catch (err) {
                console.log(err);
                setSubmissionError(err);
              }
            }}
          >
            Valider et envoyer
          </MainCtaButton>
          {submissionError && (
            <Typography color="error">
              {formatGraphQLError(submissionError)}
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
}
