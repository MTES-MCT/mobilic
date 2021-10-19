import React from "react";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Switch from "@material-ui/core/Switch/Switch";

export function ContradictorySwitch({
  className,
  shouldDisplayInitialEmployeeVersion,
  setShouldDisplayInitialEmployeeVersion
}) {
  return (
    <Grid
      container
      spacing={0}
      alignItems="center"
      wrap="nowrap"
      className={className}
    >
      <Grid item>
        <Typography variant="body2">Après</Typography>
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
        <Typography variant="body2">Avant validation gestionnaire</Typography>
      </Grid>
    </Grid>
  );
}
