import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
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

export function Comment({ comment, withFullDate, cancelComment }) {
  const classes = useStyles();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  return (
    <ListItem disableGutters>
      <ListItemText
        primary={
          <>
            <Typography variant="body2" className={classes.submitter}>
              {comment.submitterId
                ? formatPersonName(store.userInfo())
                : formatPersonName(comment.submitter)}
              {" - "}
            </Typography>
            <Typography variant="body2" className={classes.time}>
              {withFullDate ? `${formatDay(comment.receptionTime)} ` : ""}
              {formatTimeOfDay(comment.receptionTime)}
            </Typography>
          </>
        }
        secondary={comment.text}
        secondaryTypographyProps={{ className: classes.text }}
      />
      {cancelComment &&
        (comment.submitterId || comment.submitter.id) === store.userId() && (
          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={() =>
                modals.open("confirmation", {
                  title: "Confirmer suppression du commentaire",
                  handleConfirm: () => cancelComment(comment)
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
