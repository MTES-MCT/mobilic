import React from "react";
import { getTime } from "common/utils/events";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { MainCtaButton } from "../components/MainCtaButton";
import { formatApiError } from "common/utils/errors";
import {
  computeMissionKpis,
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
  pushNewActivityEvent,
  editActivityEvent,
  validateMission,
  editMissionExpenditures,
  previousMissionEnd
}) {
  const [submissionError, setSubmissionError] = React.useState(null);

  const missionMetrics = computeMissionKpis(currentMission);

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
          } du ${prettyFormatDay(getTime(currentMission))}`}
        </Typography>
        <WorkTimeSummaryKpiGrid metrics={missionMetrics} />
      </Box>
      <MissionDetails
        mission={currentMission}
        editActivityEvent={editActivityEvent}
        editExpenditures={editMissionExpenditures}
        previousMissionEnd={previousMissionEnd}
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
              {formatApiError(submissionError)}
            </Typography>
          )}
        </Box>
      )}
    </Container>
  );
}
