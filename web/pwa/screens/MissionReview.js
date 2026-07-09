import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import {
  computeTimesAndDurationsFromActivities,
  renderMissionKpis,
  WorkTimeSummaryKpiGrid
} from "../components/WorkTimeSummary";
import { prettyFormatDay } from "common/utils/time";
import { MissionDetails } from "../components/MissionDetails";
import { fr } from "@codegouvfr/react-dsfr";
import { Header } from "../../common/Header";

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
  pushNewTeamActivityEvent,
  editActivityEvent,
  validateMission,
  editExpendituresForTeam,
  previousMissionEnd,
  logComment,
  editVehicle,
  cancelComment,
  registerKilometerReading
}) {
  const classes = useStyles();
  return (
    <Container style={{ flexGrow: 1 }} className="flex-column" disableGutters>
      <Header forceMobile />
      <Box p={2} pt={2} pb={4} className={classes.overviewTimersContainer}>
        <Typography
          className={classes.overviewTimersTitle}
          align="left"
          variant="h5"
          component="h1"
          color={fr.colors.decisions.text.inverted.grey.default}
        >
          Récapitulatif de la mission
          {` ${currentMission.name} du ${prettyFormatDay(
            currentMission.startTime
          )}`}
        </Typography>
        <WorkTimeSummaryKpiGrid
          metrics={renderMissionKpis(
            computeTimesAndDurationsFromActivities(currentMission.activities)
          )}
        />
      </Box>
      <MissionDetails
        mission={currentMission}
        editActivityEvent={editActivityEvent}
        editExpenditures={editExpendituresForTeam}
        editVehicle={vehicle =>
          editVehicle({ mission: currentMission, vehicle })
        }
        previousMissionEnd={previousMissionEnd}
        createActivity={args =>
          pushNewTeamActivityEvent({ ...args, switchMode: false })
        }
        validateMission={validateMission}
        logComment={logComment}
        cancelComment={cancelComment}
        editKilometerReading={registerKilometerReading}
        titleProps={{ component: "h2" }}
      />
    </Container>
  );
}
