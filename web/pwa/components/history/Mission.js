import React from "react";
import {
  computeTimesAndDurationsFromActivities,
  renderMissionKpis,
  WorkTimeSummaryAdditionalInfo,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { MissionDetails } from "../MissionDetails";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Collapse from "@material-ui/core/Collapse/Collapse";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { ItalicWarningTypography } from "./ItalicWarningTypography";
import { prettyFormatDay } from "common/utils/time";

const useStyles = makeStyles(theme => ({
  alternateCard: {
    backgroundColor: theme.palette.background.default
  },
  darkCard: {
    backgroundColor: theme.palette.grey[700],
    color: theme.palette.primary.contrastText
  }
}));

export function MissionSummary({
  mission,
  alternateDisplay = false,
  children,
  collapsable = false,
  defaultOpenCollapse = false,
  showMetrics = true
}) {
  const [open, setOpen] = React.useState(defaultOpenCollapse);
  const classes = useStyles();

  const kpis = computeTimesAndDurationsFromActivities(mission.activities);
  const actualDay = mission?.startTime;

  return (
    <>
      <WorkTimeSummaryAdditionalInfo
        disableTopMargin
        disableBottomMargin={false}
        className={alternateDisplay ? classes.darkCard : ""}
      >
        <Box style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography className="bold">
            {mission.name
              ? `Nom de la mission : ${mission.name}`
              : `Mission du ${prettyFormatDay(actualDay)}`}
          </Typography>
          {collapsable && (
            <IconButton
              aria-label={open ? "Masquer" : "Afficher"}
              color="inherit"
              className="no-margin-no-padding"
              onClick={() => setOpen(!open)}
            >
              {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </Box>
      </WorkTimeSummaryAdditionalInfo>
      <Collapse in={open || !collapsable}>
        {!mission.ended && (
          <WorkTimeSummaryAdditionalInfo
            disableTopMargin
            disableBottomMargin={false}
            {...(alternateDisplay
              ? { elevation: 0, className: classes.alternateCard }
              : {})}
          >
            <ItalicWarningTypography>
              Mission en cours !
            </ItalicWarningTypography>
          </WorkTimeSummaryAdditionalInfo>
        )}
        {showMetrics && (
          <WorkTimeSummaryKpiGrid
            metrics={renderMissionKpis(kpis, "Durée", true)}
            cardProps={
              alternateDisplay
                ? { elevation: 0, className: classes.alternateCard }
                : {}
            }
          />
        )}
        {children}
      </Collapse>
    </>
  );
}

export function Mission({
  mission,
  editActivityEvent,
  createActivity,
  editExpenditures,
  currentMission,
  validateMission,
  logComment,
  editVehicle,
  cancelComment,
  coworkers,
  registerKilometerReading,
  vehicles,
  userId
}) {
  return (
    <div>
      <MissionSummary mission={mission}>
        <WorkTimeSummaryAdditionalInfo disablePadding>
          <MissionDetails
            inverseColors
            mission={mission}
            editActivityEvent={
              mission.adminValidation ? null : editActivityEvent
            }
            createActivity={mission.adminValidation ? null : createActivity}
            editExpenditures={mission.adminValidation ? null : editExpenditures}
            editVehicle={
              mission.adminValidation
                ? null
                : vehicle => editVehicle({ mission, vehicle })
            }
            nullableEndTimeInEditActivity={
              currentMission ? mission.id === currentMission.id : true
            }
            hideValidations={!mission.ended}
            validateMission={validateMission}
            validationButtonName="Valider"
            logComment={logComment}
            cancelComment={cancelComment}
            coworkers={coworkers}
            vehicles={vehicles}
            userId={userId}
            editKilometerReading={
              mission.adminValidation ? null : registerKilometerReading
            }
          />
        </WorkTimeSummaryAdditionalInfo>
      </MissionSummary>
    </div>
  );
}
