import React from "react";
import MuiDrawer from "@mui/material/SwipeableDrawer";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  drawer: {
    padding: theme.spacing(2)
  }
}));

export const Drawer = ({
  children,
  open,
  onClose,
  zIndex = 1500,
  id = null
}) => {
  const classes = useStyles();
  return (
    <MuiDrawer
      anchor="right"
      open={!!open}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={onClose}
      PaperProps={{
        className: classes.drawer,
        sx: {
          width: { xs: "100vw", md: 860 }
        }
      }}
      ModalProps={{
        sx: { zIndex },
        id
      }}
    >
      {children}
    </MuiDrawer>
  );
};
