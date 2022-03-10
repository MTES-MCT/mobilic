import React from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import Slide from "@mui/material/Slide";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";

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
        className="flex-column"
        style={{ flexGrow: 1, flexShrink: 0, height: "100%", padding: 0 }}
      >
        <Box
          px={2}
          pb={2}
          pt={2}
          className="header-container flex-row-flex-start"
          style={{ position: "static", width: "100%", flexShrink: 0 }}
        >
          <Button
            variant="outlined"
            color="primary"
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
