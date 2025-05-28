import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { formatDay, formatTimeOfDay } from "common/utils/time";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { formatPersonName } from "common/utils/coworkers";
import { useModals } from "common/utils/modals";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";

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
  icon = null,
  iconClassName = null,
  cancel,
  iconBackgroundColor = null
}) {
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  return (
    <ListItem disableGutters>
      {icon && (
        <ListItemAvatar>
          <Avatar
            className={iconClassName}
            style={{ backgroundColor: iconBackgroundColor }}
          >
            {icon}
          </Avatar>
        </ListItemAvatar>
      )}
      <ListItemText
        primary={
          <>
            <Typography variant="body2" className={classes.submitter}>
              {submitter ? formatPersonName(submitter) : "Mobilic"}
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
