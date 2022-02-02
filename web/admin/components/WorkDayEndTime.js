import { Link } from "../../common/LinkButton";
import React from "react";
import { formatTimeOfDay, now } from "common/utils/time";
import { DEFAULT_LAST_ACTIVITY_TOO_LONG } from "common/utils/mission";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles(theme => ({
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  errorText: {
    color: theme.palette.error.main,
    fontWeight: "bold"
  }
}));

export function WorkDayEndTime({ endTime, dayAggregate, openMission }) {
  const isLastActivityTooLong = () =>
    dayAggregate.lastActivityStartTime < now() - DEFAULT_LAST_ACTIVITY_TOO_LONG;
  const lastMissionId = () =>
    Object.keys(dayAggregate.missionNames)[
      Object.keys(dayAggregate.missionNames).length - 1
    ];
  const classes = useStyles();
  return endTime ? (
    formatTimeOfDay(endTime)
  ) : !isLastActivityTooLong() ? (
    <span className={classes.warningText}>En cours</span>
  ) : (
    <Link
      key={lastMissionId()}
      onClick={e => {
        e.stopPropagation();
        openMission(lastMissionId());
      }}
    >
      <Tooltip
        title={`Activité en cours depuis plus de ${DEFAULT_LAST_ACTIVITY_TOO_LONG /
          3600} heures`}
      >
        <span className={classes.errorText}>En cours ⚠</span>
      </Tooltip>
    </Link>
  );
}
