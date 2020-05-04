import React from "react";
import Dialog from "@material-ui/core/Dialog/Dialog";
import Box from "@material-ui/core/Box";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Slide from "@material-ui/core/Slide/Slide";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const useStyles = makeStyles(theme => ({
  title: {
    marginTop: theme.spacing(2),
  },
  slimContainer: {
    maxWidth: 400,
  }
}));

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
