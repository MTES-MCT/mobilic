import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useControl } from "../../../utils/contextControl";
import { CONTROL_TYPES } from "../../../utils/useReadControlData";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2)
  }
}));

export function ControllerControlNoLicHistory() {
  const classes = useStyles();

  const { controlType } = useControl();
  const TEXT = React.useMemo(
    () =>
      controlType === CONTROL_TYPES.NO_LIC.label
        ? "Pas d'historique disponible pour un contrôle sans LIC présenté."
        : "Pas d’historique disponible pour un contrôle avec LIC papier.",
    [controlType]
  );
  return (
    <Box className={classes.container}>
      <Typography>{TEXT}</Typography>
    </Box>
  );
}
