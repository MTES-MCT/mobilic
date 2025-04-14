import React from "react";
import {
  ALERT_TYPE_PROPS_SIMPLER,
  ALERT_TYPES
} from "common/utils/regulation/alertTypes";
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
  const { alert, type, label } = regulationCheck;
  const extra = alert?.extra ? JSON.parse(alert.extra) : {};
  const alertProps = ALERT_TYPE_PROPS_SIMPLER[type];
  const rule = alertProps.rule;

  if (type === ALERT_TYPES.enoughBreak) {
    return <EnoughBreakCheck extra={extra} rule={rule} />;
  }

  const isSuccess = !alert;
  const severity = isSuccess ? "success" : "error";

  const message = isSuccess
    ? alertProps.successMessage()
    : alertProps.errorMessage(extra, label);

  return (
    <Check
      severity={severity}
      rule={rule}
      message={message}
      nightWork={extra.nightWork}
    />
  );
}

function EnoughBreakCheck({ extra, rule }) {
  const notEnoughBreak = extra.not_enough_break;
  const tooMuchUninterruptedWorkTime = extra.too_much_uninterrupted_work_time;

  const breakMessage = notEnoughBreak
    ? "Non-respect(s) du temps de pause"
    : ALERT_TYPE_PROPS_SIMPLER[
        ALERT_TYPES.minimumWorkDayBreak
      ].successMessage();

  const uninterruptedMessage = tooMuchUninterruptedWorkTime
    ? "Dépassement(s) de la durée maximale du travail ininterrompu"
    : ALERT_TYPE_PROPS_SIMPLER[
        ALERT_TYPES.maximumUninterruptedWorkTime
      ].successMessage();
  return (
    <>
      <Check
        severity={notEnoughBreak ? "error" : "success"}
        rule={rule}
        message={breakMessage}
      />
      <Check
        severity={tooMuchUninterruptedWorkTime ? "error" : "success"}
        rule={rule}
        message={uninterruptedMessage}
      />
    </>
  );
}

function Check({ severity, rule, message, nightWork = false }) {
  const openRegulationDrawer = useRegulationDrawer();
  const classes = useStyles();

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
          {nightWork && (
            <Chip className={classes.chip} label="Travail de nuit" />
          )}
        </>
      }
    />
  );
}
