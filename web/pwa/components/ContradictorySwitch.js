import React from "react";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import { makeStyles } from "@mui/styles";
import { isConnectionError } from "common/utils/errors";

const useStyles = makeStyles(theme => ({
  infoText: {
    color: "inherit",
    fontStyle: "italic",
    opacity: 0.6
  }
}));

export function ContradictorySwitch({
  contradictoryNotYetAvailable,
  emptyContradictory,
  className,
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion,
  contradictoryComputationError,
  disabled = false
}) {
  const classes = useStyles();

  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      wrap="nowrap"
      className={className}
    >
      {contradictoryNotYetAvailable ||
      contradictoryComputationError ||
      emptyContradictory ? (
        <Grid item>
          <Typography className={classes.infoText} align="left" variant="body2">
            {contradictoryNotYetAvailable
              ? "Les versions contradictoires ne sont pas visibles car la mission n'a pas encore été validée par toutes les parties (salarié, gestionnaire)."
              : contradictoryComputationError
              ? isConnectionError(contradictoryComputationError)
                ? "Les versions contradictoires ne sont pas disponibles pour le moment car il n'y a pas de connexion Internet."
                : "Les versions contradictoires ne sont pas disponibles pour le moment."
              : "Il n'y a pas eu de modifications de la part du gestionnaire."}
          </Typography>
        </Grid>
      ) : (
        <>
          <Grid item>
            <Typography variant="body2">Version gestionnaire</Typography>
          </Grid>
          <Grid item>
            <Switch
              color="secondary"
              disabled={disabled}
              checked={shouldDisplayInitialEmployeeVersion}
              onChange={e =>
                setShouldDisplayInitialEmployeeVersion(e.target.checked)
              }
            />
          </Grid>
          <Grid item>
            <Typography variant="body2">Version salarié</Typography>
          </Grid>
        </>
      )}
    </Grid>
  );
}
