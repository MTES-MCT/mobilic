import React from "react";
import { RULE_RESPECT_STATUS } from "common/utils/regulation/rules";
import { ALERT_TYPE_PROPS } from "common/utils/regulation/alertTypes";
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

export function RegulationCheck({ check }) {
  const openRegulationDrawer = useRegulationDrawer();

  const classes = useStyles();

  if (!check) return null;

  let severity;
  if (check.status === RULE_RESPECT_STATUS.success) {
    severity = "success";
  } else if (check.status === RULE_RESPECT_STATUS.pending) {
    severity = "warning";
  } else {
    severity = "error";
  }

  const alertProps = ALERT_TYPE_PROPS[check.rule];
  const rule = alertProps.rule;
  const message = alertProps.format(check.status, check.extra || {});

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
