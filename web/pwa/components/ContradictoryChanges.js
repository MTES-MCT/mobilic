import React from "react";
import Collapse from "@material-ui/core/Collapse/Collapse";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { formatTimeOfDay } from "common/utils/time";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import List from "@material-ui/core/List";
import { useToggleContradictory } from "./history/toggleContradictory";
import Skeleton from "@material-ui/lab/Skeleton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Event } from "../../common/Event";
import { ACTIVITIES } from "common/utils/activities";

export const useStyles = makeStyles(theme => ({
  noChangesText: {
    marginTop: theme.spacing(1),
    color: theme.palette.grey[600],
    fontStyle: "italic"
  }
}));

function getChangeText(change) {
  switch (change.change) {
    case "CREATE":
      return `a ajouté l'activité ${
        ACTIVITIES[change.current.type].label
      } de ${formatTimeOfDay(change.current.startTime)} à ${formatTimeOfDay(
        change.current.endTime
      )}`;
    case "DELETE":
      return `a supprimé l'activité ${
        ACTIVITIES[change.current.type].label
      } de ${formatTimeOfDay(change.current.startTime)} à ${formatTimeOfDay(
        change.current.endTime
      )}`;
    case "UPDATE":
      return `a modifié la période de l'activité ${
        ACTIVITIES[change.current.type].label
      } de ${formatTimeOfDay(change.previous.startTime)} - ${formatTimeOfDay(
        change.previous.endTime
      )} à ${formatTimeOfDay(change.current.startTime)} - ${formatTimeOfDay(
        change.current.endTime
      )}`;
    default:
      return "changement inconnu.";
  }
}

export function ContradictoryChanges({ mission, userId }) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  const [
    // eslint-disable-next-line no-unused-vars
    _,
    changesHistory,
    loadingEmployeeVersion,
    hasComputedContradictory
  ] = useToggleContradictory(true, open, setOpen, [mission]);

  const userChangesHistory = changesHistory.filter(c => c.userId === userId);

  return (
    <>
      <Box mt={1} style={{ display: "flex", justifyContent: "space-between" }}>
        <Typography className="bold">Modifications gestionnaire</Typography>
        {(!hasComputedContradictory || changesHistory.length > 0) && (
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
      <Collapse
        in={open || (changesHistory.length === 0 && hasComputedContradictory)}
      >
        {loadingEmployeeVersion ? (
          <Skeleton rect width="100%" height={100} />
        ) : userChangesHistory.length === 0 ? (
          <Typography className={classes.noChangesText}>
            Il n'y a pas eu de modifications apportées par le gestionnaire
          </Typography>
        ) : (
          <List dense>
            {userChangesHistory.map(change => {
              return (
                <Event
                  key={(change.previous || change.current).id}
                  text={getChangeText(change)}
                  submitter={change.submitter}
                  submitterId={change.submitterId}
                  time={change.time}
                  withFullDate={true}
                />
              );
            })}
          </List>
        )}
      </Collapse>
    </>
  );
}
