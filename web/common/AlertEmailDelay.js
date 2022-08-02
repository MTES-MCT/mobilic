import React from "react";
import { makeStyles } from "@mui/styles";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

const useStyles = makeStyles(theme => ({
  alert: {
    textAlign: "left",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

const AlertEmailDelay = () => {
  const classes = useStyles();
  return (
    <Alert severity="warning" className={classes.alert}>
      <Typography>Il est possible que</Typography>
      <ul style={{ padding: 0 }}>
        <li>
          <Typography>
            l'email parvienne avec un léger délai, de l'ordre de quelques
            minutes normalement.
          </Typography>
        </li>
        <li>
          <Typography>
            l'email atterrisse dans votre courrier indésirable (spams).
          </Typography>
        </li>
      </ul>
    </Alert>
  );
};

export default AlertEmailDelay;
