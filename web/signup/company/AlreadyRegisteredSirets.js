import React from "react";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { InfoItem } from "../../home/InfoField";

const useStyles = makeStyles(theme => ({
  grid: {
    marginBottom: theme.spacing(2)
  }
}));

const AlreadyRegisteredSirets = () => {
  const classes = useStyles();

  return (
    <Grid
      container
      spacing={2}
      direction="column"
      alignItems="center"
      className={classes.grid}
    >
      <Grid item xs={12}>
        <InfoItem bold info={`L'entreprise est déjà inscrite.`} />
      </Grid>
    </Grid>
  );
};

export default AlreadyRegisteredSirets;
