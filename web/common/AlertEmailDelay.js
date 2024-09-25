import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Notice from "./Notice";

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
    <Notice
      type="warning"
      className={classes.alert}
      description={
        <>
          Il est possible que
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
        </>
      }
    />
  );
};

export default AlertEmailDelay;
