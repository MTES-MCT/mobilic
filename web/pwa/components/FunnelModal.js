import React from "react";
import Dialog from "@material-ui/core/Dialog/Dialog";
import Box from "@material-ui/core/Box";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import Slide from "@material-ui/core/Slide/Slide";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";

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
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main
  },
  container: {
    backgroundColor: darkBackground =>
      darkBackground
        ? theme.palette.primary.main
        : theme.palette.background.paper
  }
}));

export function FunnelModal({
  open,
  handleBack,
  children,
  darkBackground = false
}) {
  const classes = useStyles(darkBackground);
  return (
    <Dialog
      fullScreen
      open={open}
      onClose={() => {}}
      TransitionComponent={Transition}
      PaperProps={{ className: `scrollable ${classes.container}` }}
    >
      <Container
        maxWidth="sm"
        className="flex-column scrollable"
        style={{ flexGrow: 1, height: "100%", padding: 0 }}
      >
        <Box
          px={2}
          pb={2}
          pt={2}
          className="header-container flex-row-flex-start"
          style={{ position: "static", width: "100%" }}
        >
          <Button
            className={classes.backButton}
            variant="contained"
            disableElevation
            startIcon={<ChevronLeftIcon />}
            onClick={handleBack}
          >
            Retour
          </Button>
        </Box>
        {children}
      </Container>
    </Dialog>
  );
}
