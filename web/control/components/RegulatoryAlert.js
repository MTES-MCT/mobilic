import React from "react";
import mapValues from "lodash/mapValues";
import {
  formatMinutesFromSeconds,
  formatTimer,
  isoFormatLocalDate,
  prettyFormatMonth,
  textualPrettyFormatDayHour,
  textualPrettyFormatWeek,
  jsToUnixTimestamp,
  textualPrettyFormatDay
} from "common/utils/time";
import { Link } from "../../common/LinkButton";
import { ALERT_TYPES } from "common/utils/regulation/alertTypes";
import Stack from "@mui/material/Stack";
import { Checkbox } from "@dataesr/react-dsfr";

function formatAlertPeriod(alert, type) {
  if (alert.month) {
    return prettyFormatMonth(alert.month);
  }
  switch (type) {
    case ALERT_TYPES.minimumDailyRest: {
      return textualPrettyFormatDayHour(
        jsToUnixTimestamp(new Date(alert.extra.breach_period_end).getTime())
      );
    }
    case ALERT_TYPES.maximumWorkedDaysInWeek: {
      return textualPrettyFormatWeek(alert.week);
    }
    case ALERT_TYPES.maximumUninterruptedWorkTime: {
      return textualPrettyFormatDayHour(
        jsToUnixTimestamp(
          new Date(alert.extra.longest_uninterrupted_work_end).getTime()
        )
      );
    }
    case ALERT_TYPES.minimumWorkDayBreak:
    case ALERT_TYPES.maximumWorkDayTime: {
      return textualPrettyFormatDayHour(
        jsToUnixTimestamp(new Date(alert.extra.work_range_end).getTime())
      );
    }
    case ALERT_TYPES.noPaperLic: {
      return textualPrettyFormatDay(alert.day);
    }
    default: {
      return "Mission";
    }
  }
}

function formatAlertText(alert, type) {
  switch (type) {
    case ALERT_TYPES.minimumDailyRest: {
      const maxBreakLengthInSeconds =
        alert.extra.breach_period_max_break_in_seconds;
      return (
        <span>
          Durée du repos le plus long sur les 24 dernières heures :{" "}
          <b>{formatTimer(maxBreakLengthInSeconds)}</b>
        </span>
      );
    }
    case ALERT_TYPES.maximumWorkedDaysInWeek: {
      const maxBreakLengthInSeconds = alert.extra.rest_duration_s;
      const tooManyDays = alert.extra.too_many_days;
      return (
        <span>
          {maxBreakLengthInSeconds && (
            <>
              Durée du repos hebdo :{" "}
              <b>{formatTimer(maxBreakLengthInSeconds)}</b>
              <br />
            </>
          )}
          {tooManyDays && (
            <>La semaine ne comporte aucune journée non travaillée</>
          )}
        </span>
      );
    }
    case ALERT_TYPES.maximumUninterruptedWorkTime: {
      const uninterruptedWorkTime =
        alert.extra.longest_uninterrupted_work_in_seconds;
      return (
        <span>
          Durée du temps de service depuis le dernier repos quotidien :{" "}
          <b>{formatTimer(uninterruptedWorkTime)}</b>
        </span>
      );
    }
    case ALERT_TYPES.minimumWorkDayBreak: {
      const breakTimeInSeconds = alert.extra.total_break_time_in_seconds;
      const workTimeInSeconds = alert.extra.work_range_in_seconds;
      return (
        <span>
          Durée du temps de pause :{" "}
          <b>{formatMinutesFromSeconds(breakTimeInSeconds)}</b> pour une période
          de travail de <b>{formatTimer(workTimeInSeconds)}</b>
        </span>
      );
    }
    case ALERT_TYPES.maximumWorkDayTime: {
      const nightWork = alert.extra.night_work;
      const workTime = alert.extra.work_range_in_seconds;
      return (
        <span>
          Durée de travail {nightWork ? " (travail de nuit)" : ""} :{" "}
          <b>{formatTimer(workTime)}</b>
        </span>
      );
    }
    default:
      return <span></span>;
  }
}

export function RegulatoryAlert({
  alert,
  type,
  sanction,
  isReportable,
  setPeriodOnFocus,
  setTab,
  isReportingInfractions,
  onUpdateInfraction,
  readOnlyAlerts
}) {
  return (
    <Stack direction="row" spacing={2} alignItems="baseline" flexWrap="nowrap">
      {!readOnlyAlerts && isReportable && (
        <Checkbox
          checked={alert.checked}
          disabled={!isReportingInfractions}
          onChange={e => {
            const alertDate = alert.day || alert.week || alert.month;
            onUpdateInfraction(sanction, alertDate, e.target.checked);
          }}
        />
      )}
      <div>
        <Link
          onClick={e => {
            e.preventDefault();
            setTab("history");
            setPeriodOnFocus(
              alert.day || alert.week || alert.month
                ? mapValues(alert, date => isoFormatLocalDate(parseInt(date)))
                : alert
            );
          }}
        >
          {formatAlertPeriod(alert, type)}
        </Link>
        <div>{formatAlertText(alert, type)}</div>
      </div>
    </Stack>
  );
}
