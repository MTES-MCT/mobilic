import React from "react";
import Dialog from "@material-ui/core/Dialog/Dialog";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide/Slide";
import Button from "@material-ui/core/Button";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export function FunnelModal({ open, handleBack, children }) {
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={() => {}}
      TransitionComponent={Transition}
    >
      <Box px={2} pb={1} pt={2} className="header-container flex-row-flex-start">
        <Button disableElevation startIcon={<ChevronLeftIcon />} color="primary" onClick={handleBack}>
          Retour
        </Button>
      </Box>
      {children}
    </Dialog>
  );
}
