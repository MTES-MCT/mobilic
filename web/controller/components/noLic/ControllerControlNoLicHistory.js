import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(2)
  }
}));

export function ControllerControlNoLicHistory() {
  const classes = useStyles();
  return (
    <Box className={classes.container}>
      <Typography>
        Pas d'historique disponible pour un contrôle sans LIC présenté
      </Typography>
    </Box>
  );
}
