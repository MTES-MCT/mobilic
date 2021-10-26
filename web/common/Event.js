import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import { formatDay, formatTimeOfDay } from "common/utils/time";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Typography from "@material-ui/core/Typography";
import { formatPersonName } from "common/utils/coworkers";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  submitter: {
    display: "inline",
    fontWeight: "bold",
    fontSize: "0.8rem"
  },
  time: {
    fontWeight: "bold",
    color: theme.palette.grey[500],
    fontSize: "0.8rem",
    display: "inline"
  },
  text: {
    fontStyle: "italic"
  }
}));

export function Event({
  text,
  submitter,
  submitterId,
  time,
  withFullDate,
  cancel
}) {
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  return (
    <ListItem disableGutters>
      <ListItemText
        primary={
          <>
            <Typography variant="body2" className={classes.submitter}>
              {submitter
                ? formatPersonName(submitter)
                : formatPersonName(store.userInfo())}
              {" - "}
            </Typography>
            <Typography variant="body2" className={classes.time}>
              {withFullDate ? `${formatDay(time, true)} ` : ""}
              {formatTimeOfDay(time)}
            </Typography>
          </>
        }
        secondary={text}
        secondaryTypographyProps={{ className: classes.text }}
      />
      {cancel && (submitterId || submitter.id) === store.userId() && (
        <ListItemSecondaryAction>
          <IconButton
            edge="end"
            onClick={() =>
              modals.open("confirmation", {
                title: "Confirmer suppression de l'observation",
                handleConfirm: cancel
              })
            }
          >
            <DeleteIcon color="error" />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}
