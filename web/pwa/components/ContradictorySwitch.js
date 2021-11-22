import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch/Switch";
import makeStyles from "@material-ui/core/styles/makeStyles";

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
  setShouldDisplayInitialEmployeeVersion
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
      {contradictoryNotYetAvailable || emptyContradictory ? (
        <Grid item>
          <Typography className={classes.infoText} align="left" variant="body2">
            {contradictoryNotYetAvailable
              ? "Les versions contradictoires ne sont pas visibles car la mission n'a pas encore été validée par toutes les parties (salarié, gestionnaire)"
              : "Il n'y a pas eu de modifications de la part du gestionnaire"}
          </Typography>
        </Grid>
      ) : (
        <>
          <Grid item>
            <Typography variant="body2">Version gestionnaire</Typography>
          </Grid>
          <Grid item>
            <Switch
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
