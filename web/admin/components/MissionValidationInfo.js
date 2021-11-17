import { formatDay } from "common/utils/time";
import Typography from "@material-ui/core/Typography";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  validationTime: {
    fontStyle: "italic",
    color: theme.palette.success.main
  },
  nonValidationText: {
    fontStyle: "italic",
    color: theme.palette.warning.main
  }
}));

export function MissionValidationInfo({
  validation,
  className,
  isAdmin = false
}) {
  const classes = useStyles();

  return (
    <Typography
      className={`${
        validation ? classes.validationTime : classes.nonValidationText
      } ${className}`}
    >
      <span style={{ fontStyle: "normal" }}>{validation ? "✅" : "⚠️"}</span>
      {validation
        ? `${
            isAdmin ? "validé par un gestionnaire" : "a validé"
          } le ${formatDay(validation.receptionTime, true)}`
        : `${
            isAdmin
              ? "en attente de validation gestionnaire"
              : "n'a pas encore validé la mission"
          }`}
    </Typography>
  );
}
