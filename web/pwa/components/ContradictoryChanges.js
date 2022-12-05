import React from "react";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import List from "@mui/material/List";
import { useToggleContradictory } from "./history/toggleContradictory";
import Skeleton from "@mui/material/Skeleton";
import { makeStyles } from "@mui/styles";
import { Event } from "../../common/Event";
import { MISSION_RESOURCE_TYPES } from "common/utils/contradictory";
import { getChangeIconAndText } from "../../common/logEvent";
import { now } from "common/utils/time";
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
  missionEvent: {
    backgroundColor: theme.palette.primary.main
  },
  updateActivityEvent: {
    backgroundColor: theme.palette.warning.main
  },
  validationEvent: {
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

  const iconClassName = (event, color = null) => {
    if (event.type !== "CREATE") {
      return classes.updateActivityEvent;
    }
    if (event.resourceType === MISSION_RESOURCE_TYPES.validation) {
      return classes.validationEvent;
    }
    return classes.missionEvent;
  };

  const changesHistory = contradictoryInfo[1];
  const loadingEmployeeVersion = contradictoryInfo[2];
  const contradictoryComputationError = contradictoryInfo[5];

  const userChangesHistory = changesHistory.filter(
    c =>
      (c.userId === userId || !c.userId) &&
      (showEventsBeforeValidation || c.time >= (validationTime || now()))
  );
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
        <Typography className="bold">Historique de saisie</Typography>
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
            <List dense>
              {userChangesHistory.map(userChange => {
                const changes = getChangeIconAndText(userChange);
                return changes.map(({ icon, text, color }) => (
                  <Event
                    key={`${(userChange.after || userChange.before).id}${text}`}
                    icon={icon}
                    iconClassName={iconClassName(userChange)}
                    text={text}
                    submitter={userChange.submitter}
                    submitterId={userChange.submitterId}
                    time={userChange.time}
                    withFullDate={true}
                    iconBackgroundColor={color}
                  />
                ));
              })}
            </List>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
