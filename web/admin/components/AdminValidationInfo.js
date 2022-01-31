import { formatDay } from "common/utils/time";
import Typography from "@material-ui/core/Typography";
import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classnames from "classnames";

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

export function AdminValidationInfo({ adminValidations, className }) {
  const classes = useStyles();

  return adminValidations && adminValidations.length > 0 ? (
    adminValidations.map(validation => (
      <Typography
        key={validation.id}
        className={classnames(classes.validationTime, className)}
      >
        <span style={{ fontStyle: "normal" }}>{validation ? "✅" : "⚠️"}</span>
        {`Validé par un gestionnaire le ${formatDay(
          validation.receptionTime,
          true
        )}${validation.workerName ? ` pour ${validation.workerName}` : ""}`}
      </Typography>
    ))
  ) : (
    <Typography className={classnames(classes.nonValidationText, className)}>
      <span style={{ fontStyle: "normal" }}>⚠️</span>
      en attente de validation gestionnaire
    </Typography>
  );
}
