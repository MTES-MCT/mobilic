import React from "react";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import classNames from "classnames";
import { PASSWORD_POLICY_RULES } from "common/utils/passwords";
import Box from "@mui/material/Box";

const useStyles = makeStyles(theme => ({
  wrapper: {
    marginBottom: theme.spacing(2)
  },
  helperText: {
    color: theme.palette.grey[600],
    fontSize: "0.875rem",
    textAlign: "left"
  },
  icon: {
    verticalAlign: "middle",
    float: "left",
    paddingRight: theme.spacing(1)
  },
  info: {
    color: theme.palette.primary.main
  },
  error: {
    color: theme.palette.error.main
  },
  validated: {
    color: theme.palette.success.main
  }
}));

export function PasswordHelper({ password }) {
  const classes = useStyles();

  const getHelper = (text, colorClass) => (
    <Typography className={classes.helperText}>
      <span className={colorClass}>
        <span
          className={classNames(
            "fr-icon-information-fill fr-icon--sm",
            classes.icon
          )}
          aria-hidden="true"
        ></span>
        {text}
      </span>
    </Typography>
  );

  return (
    <Box className={classes.wrapper}>
      <Typography className={classes.helperText}>
        Votre mot de passe doit contenir :
      </Typography>
      {!password ? (
        <>
          {PASSWORD_POLICY_RULES.map((rule, i) => (
            <div key={`password_rule${i}`}>
              {getHelper(rule.message, classes.info)}
            </div>
          ))}
        </>
      ) : (
        <>
          {PASSWORD_POLICY_RULES.map((rule, i) => (
            <div key={`password_rule${i}`}>
              {getHelper(
                rule.message,
                rule.validator(password) ? classes.validated : classes.error
              )}
            </div>
          ))}
        </>
      )}
    </Box>
  );
}
