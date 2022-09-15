import React from "react";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import { useToggleContradictory } from "./history/toggleContradictory";
import Skeleton from "@mui/material/Skeleton";
import { makeStyles } from "@mui/styles";
import { Event } from "../../common/Event";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import { MISSION_RESOURCE_TYPES } from "common/utils/contradictory";
import { getChangeIconAndText } from "../../common/logEvent";
import {
  formatDateTime,
  formatTimeOfDay,
  getStartOfDay,
  now
} from "common/utils/time";
import { isConnectionError } from "common/utils/errors";
import { Accordion, AccordionDetails } from "@mui/material";
import AccordionSummary from "@mui/material/AccordionSummary";

export const useStyles = makeStyles(theme => ({
  noChangesText: {
    marginTop: theme.spacing(1),
    color: theme.palette.grey[600],
    fontStyle: "italic",
    marginBottom: theme.spacing(1)
  },
  employeeChange: {
    backgroundColor: theme.palette.primary.light
  },
  adminChange: {
    backgroundColor: theme.palette.warning.main
  },
  validation: {
    backgroundColor: theme.palette.success.main
  },
  arrow: {
    marginBottom: theme.spacing(-1)
  },
  collapse: {
    display: "block",
    background: "inherit",
    padding: 0
  },
  accordion: {
    "&::before": {
      content: "none"
    },
    "&.Mui-disabled": {
      background: "inherit"
    },
    background: "inherit"
  },
  accordionTitle: {
    padding: 0
  }
}));

export function ContradictoryChanges({
  mission,
  validationTime,
  showEventsBeforeValidation = true,
  userId,
  cacheInStore,
  controlId = null
}) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  const contradictoryInfo = useToggleContradictory(
    true,
    open,
    setOpen,
    [[mission, validationTime || now()]],
    cacheInStore,
    controlId
  );

  const changesHistory = contradictoryInfo[1];
  const loadingEmployeeVersion = contradictoryInfo[2];
  const contradictoryComputationError = contradictoryInfo[5];

  const userChangesHistory = changesHistory.filter(
    c => c.userId === userId || !c.userId
  );

  const userChangesAfterValidation = userChangesHistory.filter(
    c => c.time > (validationTime || now())
  );
  const userChangesBeforeValidation = userChangesHistory.filter(
    c => c.time <= (validationTime || now())
  );

  const minStartTime = Math.min(
    ...userChangesHistory.map(c => c.after?.startTime).filter(Boolean)
  );
  const maxEndTime = Math.max(
    ...userChangesHistory.map(c => c.after?.endTime).filter(Boolean)
  );
  const datetimeFormatter =
    getStartOfDay(minStartTime) === getStartOfDay(maxEndTime)
      ? formatTimeOfDay
      : formatDateTime;

  return (
    <Accordion
      elevation={0}
      className={classes.accordion}
      expanded={open || contradictoryComputationError}
      disabled={contradictoryComputationError}
      onChange={
        contradictoryComputationError
          ? null
          : (e, newValue) => setOpen(newValue)
      }
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        className={classes.accordionTitle}
      >
        <Typography className="bold">
          {showEventsBeforeValidation
            ? "Historique de saisie"
            : "Modifications gestionnaire"}
        </Typography>
      </AccordionSummary>
      <AccordionDetails className={classes.collapse}>
        {loadingEmployeeVersion ? (
          <Skeleton variant="rectangular" width="100%" height={100} />
        ) : contradictoryComputationError ? (
          <Typography className={classes.noChangesText}>
            {isConnectionError(contradictoryComputationError)
              ? "Les données ne sont pas disponibles pour le moment car il n'y a pas de connexion Internet"
              : `Données non disponibles pour le moment`}
          </Typography>
        ) : (
          <>
            {userChangesAfterValidation.filter(
              ({ type }) => type !== MISSION_RESOURCE_TYPES.validation
            ).length === 0 ? (
              <Typography className={classes.noChangesText}>
                {validationTime
                  ? "Il n'y a pas de modifications du gestionnaire pour le moment"
                  : "Il n'y a pas eu de modifications apportées par le gestionnaire"}
              </Typography>
            ) : (
              <List dense>
                {userChangesAfterValidation.map(change => {
                  const { icon, text } = getChangeIconAndText(
                    change,
                    datetimeFormatter
                  );
                  return (
                    <Event
                      key={`${(change.after || change.before).id}${
                        change.time
                      }`}
                      icon={icon}
                      iconClassName={
                        change.resourceType ===
                        MISSION_RESOURCE_TYPES.validation
                          ? classes.validation
                          : classes.adminChange
                      }
                      text={text}
                      submitter={change.submitter}
                      submitterId={change.submitterId}
                      time={change.time}
                      withFullDate={true}
                    />
                  );
                })}
              </List>
            )}
          </>
        )}
        {!contradictoryComputationError &&
          showEventsBeforeValidation && [
            <Typography
              key={0}
              variant="caption"
              style={{ textTransform: "uppercase" }}
            >
              <ArrowUpwardIcon className={classes.arrow} /> Modifications
              gestionnaire
            </Typography>,
            <hr
              key={1}
              style={{ height: 1, width: "100%", borderTop: "dotted 1px" }}
              className="hr-unstyled"
            />,
            <Typography
              key={2}
              variant="caption"
              style={{ textTransform: "uppercase" }}
            >
              <ArrowDownward className={classes.arrow} /> Saisie salarié
            </Typography>,
            <List key={3} dense>
              {userChangesBeforeValidation.map(change => {
                const { icon, text } = getChangeIconAndText(
                  change,
                  datetimeFormatter
                );
                return (
                  <Event
                    key={`${(change.after || change.before).id}${change.time}`}
                    icon={icon}
                    text={text}
                    iconClassName={
                      change.resourceType === MISSION_RESOURCE_TYPES.validation
                        ? classes.validation
                        : classes.employeeChange
                    }
                    submitter={change.submitter}
                    submitterId={change.submitterId}
                    time={change.time}
                    withFullDate={true}
                  />
                );
              })}
            </List>
          ]}
      </AccordionDetails>
    </Accordion>
  );
}
