import React from "react";
import MuiDrawer from "@mui/material/SwipeableDrawer";

export const Drawer = ({
  children,
  open,
  onClose,
  zIndex = 1500,
  id = null
}) => {
  return (
    <MuiDrawer
      anchor="right"
      open={!!open}
      disableSwipeToOpen
      disableDiscovery
      onOpen={() => {}}
      onClose={onClose}
      PaperProps={{
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
