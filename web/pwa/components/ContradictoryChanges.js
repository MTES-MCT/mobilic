import React from "react";
import Collapse from "@material-ui/core/Collapse/Collapse";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import List from "@material-ui/core/List";
import { useToggleContradictory } from "./history/toggleContradictory";
import Skeleton from "@material-ui/lab/Skeleton";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { Event } from "../../common/Event";
import ArrowUpwardIcon from "@material-ui/icons/ArrowUpward";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import { MISSION_RESOURCE_TYPES } from "common/utils/contradictory";
import { getChangeIconAndText } from "../../common/logEvent";

export const useStyles = makeStyles(theme => ({
  noChangesText: {
    marginTop: theme.spacing(1),
    color: theme.palette.grey[600],
    fontStyle: "italic"
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
  }
}));

export function ContradictoryChanges({
  mission,
  validationTime,
  showEventsBeforeValidation = true,
  userId,
  cacheInStore
}) {
  const [open, setOpen] = React.useState(false);
  const classes = useStyles();

  const [
    // eslint-disable-next-line no-unused-vars
    _,
    changesHistory,
    loadingEmployeeVersion
  ] = useToggleContradictory(
    true,
    open,
    setOpen,
    [[mission, validationTime]],
    cacheInStore
  );

  const userChangesHistory = changesHistory
    .filter(c => c.userId === userId || !c.userId)
    .sort((c1, c2) => c2.time - c1.time);
  const userChangesAfterValidation = userChangesHistory.filter(
    c => c.time > validationTime
  );
  const userChangesBeforeValidation = userChangesHistory.filter(
    c => c.time <= validationTime
  );

  return (
    <>
      <Box
        mt={1}
        style={{ display: "flex", justifyContent: "space-between" }}
        onClick={() => setOpen(!open)}
      >
        <Typography className="bold">Historique de saisie</Typography>
        <IconButton
          aria-label={open ? "Masquer" : "Afficher"}
          color="inherit"
          className="no-margin-no-padding"
        >
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={open}>
        {loadingEmployeeVersion ? (
          <Skeleton rect width="100%" height={100} />
        ) : (
          <>
            {userChangesAfterValidation.filter(
              ({ type }) => type !== MISSION_RESOURCE_TYPES.validation
            ).length === 0 ? (
              <Typography className={classes.noChangesText}>
                Il n'y a pas eu de modifications apportées par le gestionnaire
              </Typography>
            ) : (
              <List dense>
                {userChangesAfterValidation.map(change => {
                  const { icon, text } = getChangeIconAndText(change);
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
        <Typography variant="caption" style={{ textTransform: "uppercase" }}>
          <ArrowUpwardIcon className={classes.arrow} /> Modifications
          gestionnaire
        </Typography>
        <hr style={{ height: 1, width: "100%", borderTop: "dotted 1px" }} />
        <Typography variant="caption" style={{ textTransform: "uppercase" }}>
          <ArrowDownward className={classes.arrow} /> Saisie salarié
        </Typography>
        <List dense>
          {userChangesBeforeValidation.map(change => {
            const { icon, text } = getChangeIconAndText(change);
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
      </Collapse>
    </>
  );
}
