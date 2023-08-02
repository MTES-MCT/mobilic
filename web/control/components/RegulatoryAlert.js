import React from "react";
import mapValues from "lodash/mapValues";
import {
  formatMinutesFromSeconds,
  formatTimeFromSeconds,
  isoFormatLocalDate,
  prettyFormatMonth,
  textualPrettyFormatDayHour,
  textualPrettyFormatWeek
} from "common/utils/time";
import { Link } from "../../common/LinkButton";
import { ALERT_TYPES } from "common/utils/regulation/alertTypes";

function formatAlertPeriod(alert, type) {
  if (alert.month) {
    return prettyFormatMonth(alert.month);
  }
  switch (type) {
    case ALERT_TYPES.minimumDailyRest: {
      return textualPrettyFormatDayHour(
        new Date(alert.extra.breach_period_end) / 1000
      );
    }
    case ALERT_TYPES.maximumWorkedDaysInWeek: {
      return textualPrettyFormatWeek(alert.week);
    }
    case ALERT_TYPES.maximumUninterruptedWorkTime: {
      return textualPrettyFormatDayHour(
        new Date(alert.extra.longest_uninterrupted_work_end) / 1000
      );
    }
    case ALERT_TYPES.minimumWorkDayBreak: {
      return textualPrettyFormatDayHour(
        new Date(alert.extra.work_range_end) / 1000
      );
    }
    case ALERT_TYPES.maximumWorkDayTime: {
      return textualPrettyFormatDayHour(
        new Date(alert.extra.work_range_end) / 1000
      );
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
          <b>{formatTimeFromSeconds(maxBreakLengthInSeconds)}</b>
        </span>
      );
    }
    case ALERT_TYPES.maximumWorkedDaysInWeek: {
      const maxBreakLengthInSeconds = alert.extra.rest_duration_s;
      const tooManyDays = alert.extra.too_many_days;
      return (
        <span>
          Durée du repos hebdo :{" "}
          <b>{formatTimeFromSeconds(maxBreakLengthInSeconds)}</b>
          {tooManyDays && (
            <>
              <br /> Trop de jours travaillés dans la semaine
            </>
          )}
        </span>
      );
    }
    case ALERT_TYPES.maximumUninterruptedWorkTime: {
      const uninterrumptedWorkTime =
        alert.extra.longest_uninterrupted_work_in_seconds;
      return (
        <span>
          Durée du temps de service depuis le dernier repos quotidien :{" "}
          <b>{formatTimeFromSeconds(uninterrumptedWorkTime)}</b>
        </span>
      );
    }
    case ALERT_TYPES.minimumWorkDayBreak: {
      const breakTimeInSeconds = alert.extra.total_break_time_in_seconds;
      const workTimeInSeconds = alert.extra.work_range_in_seconds;
      return (
        <span>
          Durée du temps de pause :{" "}
          <b>{formatMinutesFromSeconds(breakTimeInSeconds)}</b> sur une période
          de travail de <b>{formatTimeFromSeconds(workTimeInSeconds)}</b>
        </span>
      );
    }
    case ALERT_TYPES.maximumWorkDayTime: {
      const nightWork = alert.extra.night_work;
      const workTime = alert.extra.work_range_in_seconds;
      return (
        <span>
          Durée de travail {nightWork ? " (travail de nuit)" : ""} :{" "}
          <b>{formatTimeFromSeconds(workTime)}</b>
        </span>
      );
    }
    default:
      return "";
  }
}

export function RegulatoryAlert({ alert, type, setPeriodOnFocus, setTab }) {
  return (
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
  );
}
