import React from "react";
import { ALERT_TYPE_PROPS_SIMPLER } from "common/utils/regulation/alertTypes";
import { Alert } from "@mui/material";
import { Link } from "../../common/LinkButton";
import { useRegulationDrawer } from "../../landing/ResourcePage/RegulationDrawer";
import { ChevronRight } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  moreInfoIcon: {
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.25)
  }
}));

export function SimplerRegulationCheck({ regulationCheck }) {
  const openRegulationDrawer = useRegulationDrawer();
  const classes = useStyles();

  const { alert, type, label } = regulationCheck;
  const isSuccess = !alert;

  const severity = isSuccess ? "success" : "error";

  const alertProps = ALERT_TYPE_PROPS_SIMPLER[type];
  const rule = alertProps.rule;
  const message = isSuccess
    ? alertProps.successMessage()
    : alertProps.errorMessage(
        alert?.extra ? JSON.parse(alert.extra) : {},
        label
      );

  return (
    <Alert severity={severity}>
      <Link
        color="inherit"
        onClick={e => {
          e.preventDefault();
          openRegulationDrawer(rule, true);
        }}
      >
        {message}
        <ChevronRight className={classes.moreInfoIcon} />
      </Link>
    </Alert>
  );
}
