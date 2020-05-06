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
    marginTop: theme.spacing(2)
  },
  slimContainer: {
    maxWidth: 400
  },
  backButton: {
    color: theme.palette.primary.main
  }
}));

export function FunnelModal({ open, handleBack, children }) {
  const classes = useStyles();
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={() => {}}
      TransitionComponent={Transition}
    >
      <Box
        px={2}
        pb={1}
        pt={2}
        className="header-container flex-row-flex-start"
      >
        <Button
          className={classes.backButton}
          variant="contained"
          disableElevation
          color="default"
          startIcon={<ChevronLeftIcon />}
          onClick={handleBack}
        >
          Retour
        </Button>
      </Box>
      {children}
    </Dialog>
  );
}
