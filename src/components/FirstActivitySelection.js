import React from "react";
import Avatar from "@material-ui/core/Avatar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemText from "@material-ui/core/ListItemText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Dialog from "@material-ui/core/Dialog";
import { ACTIVITIES } from "../utils/activities";

export function SelectFirstActivityModal({
  open,
  handleClose,
  handleItemClick
}) {
  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>Commencer par</DialogTitle>
      <List>
        {Object.values(ACTIVITIES)
          .filter(a => a.canBeFirst)
          .map(activity => (
            <ListItem
              button
              onClick={() => {
                handleItemClick(activity.name);
                handleClose();
              }}
              key={activity.name}
            >
              <ListItemAvatar>
                <Avatar>{activity.renderIcon({ color: "primary" })}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={activity.label} />
            </ListItem>
          ))}
      </List>
    </Dialog>
  );
}
