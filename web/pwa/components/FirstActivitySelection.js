import React from "react";
import Typography from "@material-ui/core/Typography";
import { FunnelModal } from "./FunnelModal";
import Box from "@material-ui/core/Box";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { ActivitySwitch } from "./ActivitySwitch";

const useStyles = makeStyles(theme => ({
  topPanel: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  bottomFill: {
    backgroundColor: theme.palette.background.default,
    flexGrow: 1
  }
}));

export default function FirstActivitySelectionModal({
  open,
  handleClose,
  team = [],
  handleActivitySelection
}) {
  const classes = useStyles();
  return (
    <FunnelModal open={open} handleBack={handleClose} darkBackground>
      <Box p={5} pb={8} className={classes.topPanel}>
        <Typography variant="h2" align="center">
          Commencez la mission en sélectionnant la première activité
        </Typography>
      </Box>
      <ActivitySwitch
        team={team}
        pushActivitySwitchEvent={handleActivitySelection}
        disableBreak
        shouldWaitForClickHandler
      />
      <Box className={classes.bottomFill} />
    </FunnelModal>
  );
}
