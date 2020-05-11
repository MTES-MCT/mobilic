import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import {
  formatLatestEnrollmentInfo,
  resolveTeamAt
} from "common/utils/coworkers";
import { ActivityList } from "../components/ActivityList";
import { getTime } from "common/utils/events";
import PersonIcon from "@material-ui/icons/Person";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import List from "@material-ui/core/List";
import { MissionReviewSection } from "../components/MissionReviewSection";
import ListItem from "@material-ui/core/ListItem";
import Container from "@material-ui/core/Container";
import { MainCtaButton } from "../components/MainCtaButton";
import { formatGraphQLError } from "common/utils/errors";
import {
  computeDayKpis,
  WorkTimeSummaryKpiGrid
} from "../components/WorkTimeSummary";
import Chip from "@material-ui/core/Chip";
import { EXPENDITURES } from "common/utils/expenditures";
import { useModals } from "common/utils/modals";

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
  },
  expenditures: {
    flexWrap: "wrap",
    textAlign: "left",
    textTransform: "capitalize",
    "& > *": {
      margin: theme.spacing(0.5)
    }
  }
}));

export function MissionReview({
  currentMission,
  currentDayActivityEvents,
  currentMissionActivities,
  pushNewActivityEvent,
  editActivityEvent,
  validateMission,
  editMissionExpenditures
}) {
  const [submissionError, setSubmissionError] = React.useState(null);
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  const dayMetrics = computeDayKpis(currentDayActivityEvents);
  const team = resolveTeamAt(
    store,
    getTime(currentMissionActivities[currentMissionActivities.length - 1])
  );

  const classes = useStyles();
  return [
    <Container
      key={0}
      style={{ flexGrow: 1 }}
      className="flex-column scrollable"
      disableGutters
    >
      <Box p={2} py={4} className={classes.overviewTimersContainer}>
        <Typography
          className={classes.overviewTimersTitle}
          align="left"
          variant="h5"
        >
          Récapitulatif de la journée en cours
        </Typography>
        <WorkTimeSummaryKpiGrid metrics={dayMetrics} />
      </Box>
      <Box className="scrollable">
        <MissionReviewSection
          title={`Détail de la mission${
            currentMission.name ? " : " + currentMission.name : ""
          }`}
          displayExpandToggle
          className="unshrinkable"
        >
          <ActivityList
            activities={currentMissionActivities}
            editActivityEvent={editActivityEvent}
            previousMissionEnd={0}
          />
        </MissionReviewSection>
        <MissionReviewSection
          title={team.length > 0 ? "En équipe" : "En solo"}
          className={`${classes.backgroundPaper} unshrinkable scrollable`}
          style={{ flexShrink: 0 }}
        >
          {team.length > 0 && (
            <List dense>
              {team.map((tm, index) => (
                <ListItem disableGutters key={index}>
                  <PersonIcon />
                  <Typography>{`${tm.firstName} (${formatLatestEnrollmentInfo(
                    tm
                  )})`}</Typography>
                </ListItem>
              ))}
            </List>
          )}
        </MissionReviewSection>
        <MissionReviewSection
          title="Frais"
          className="unshrinkable"
          onEdit={() =>
            modals.open("expenditures", {
              handleSubmit: expenditures =>
                editMissionExpenditures(currentMission, expenditures),
              currentExpenditures: currentMission.expenditures
            })
          }
        >
          <Box className={`flex-row ${classes.expenditures}`}>
            {Object.keys(currentMission.expenditures)
              .filter(exp => currentMission.expenditures[exp] > 0)
              .map(exp => (
                <Chip key={exp} label={EXPENDITURES[exp].label} />
              ))}
          </Box>
        </MissionReviewSection>
      </Box>
    </Container>,
    <Box key={1} m={2} className="cta-container" mb={submissionError ? 2 : 4}>
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
  ];
}
