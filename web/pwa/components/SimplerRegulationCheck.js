import React from "react";
import { ALERT_TYPE_PROPS_SIMPLER } from "common/utils/regulation/alertTypes";
import Chip from "@mui/material/Chip";
import { Link } from "../../common/LinkButton";
import { useRegulationDrawer } from "../../landing/ResourcePage/RegulationDrawer";
import { ChevronRight } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import Notice from "../../common/Notice";

const useStyles = makeStyles(theme => ({
  moreInfoIcon: {
    verticalAlign: "middle",
    marginBottom: theme.spacing(0.25)
  },
  chip: {
    backgroundColor: "#FDDBFA",
    color: "#6E445A"
  }
}));

export function SimplerRegulationCheck({ regulationCheck }) {
  const openRegulationDrawer = useRegulationDrawer();
  const classes = useStyles();

  const { alert, type, label } = regulationCheck;
  const extra = alert?.extra ? JSON.parse(alert.extra) : {};
  const isSuccess = !alert;

  const severity = isSuccess ? "success" : "error";

  const alertProps = ALERT_TYPE_PROPS_SIMPLER[type];
  const rule = alertProps.rule;
  const message = isSuccess
    ? alertProps.successMessage()
    : alertProps.errorMessage(extra, label);

  return (
    <Notice
      type={severity}
      size="small"
      description={
        <>
          <Link
            color="inherit"
            onClick={e => {
              e.preventDefault();
              openRegulationDrawer(rule, true);
            }}
          >
            {message}
          </Link>
          <ChevronRight className={classes.moreInfoIcon} />
          {extra.night_work && (
            <Chip className={classes.chip} label="Travail de nuit" />
          )}
        </>
      }
    />
  );
}
