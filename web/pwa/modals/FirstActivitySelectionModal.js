import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { makeStyles } from "@mui/styles";
import { FunnelModal } from "../components/FunnelModal";
import { ActivitySwitch } from "../components/ActivitySwitch";
import { fr } from "@codegouvfr/react-dsfr";

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
  handleActivitySelection,
  requireVehicle,
  company
}) {
  const classes = useStyles();
  return (
    <FunnelModal open={open} handleBack={handleClose} darkBackground>
      <Box p={5} pb={8} className={classes.topPanel}>
        <Typography
          variant="h2"
          component="h1"
          align="center"
          color={fr.colors.decisions.text.inverted.grey.default}
        >
          Commencez la mission en sélectionnant la première activité
        </Typography>
      </Box>
      <ActivitySwitch
        team={team}
        pushActivitySwitchEvent={handleActivitySelection}
        disableBreak
        shouldWaitForClickHandler
        requireVehicle={requireVehicle}
        company={company}
      />
      <Box className={classes.bottomFill} />
    </FunnelModal>
  );
}
