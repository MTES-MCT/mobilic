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
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useInfractions } from "../../controller/utils/contextInfractions";

const formatDate = timestamp => {
  const date = new Date(timestamp);
  const unixTimestamp = jsToUnixTimestamp(date.getTime());
  return textualPrettyFormatDayHour(unixTimestamp);
};

function formatAlertPeriod(alert, type) {
  if (alert.month) {
    return prettyFormatMonth(alert.month);
  }
  switch (type) {
    case ALERT_TYPES.maximumWorkInCalendarWeek:
    case ALERT_TYPES.maximumWorkedDaysInWeek: {
      return textualPrettyFormatWeek(alert.week);
    }
    case ALERT_TYPES.maximumUninterruptedWorkTime:
    case ALERT_TYPES.minimumDailyRest:
    case ALERT_TYPES.minimumWorkDayBreak:
    case ALERT_TYPES.maximumWorkDayTime:
    case ALERT_TYPES.noPaperLic:
    case ALERT_TYPES.enoughBreak: {
      return textualPrettyFormatDay(alert.day);
    }
    default: {
      return "Mission";
    }
  }
}

export function formatAlertText(alert, type) {
  switch (type) {
    case ALERT_TYPES.minimumDailyRest: {
      const maxBreakLengthInSeconds =
        alert.extra.breach_period_max_break_in_seconds;
      return (
        <span>
          Durée de la plus longue période de repos consécutif effectuée entre le{" "}
          {formatDate(alert.extra.breach_period_start)} et le{" "}
          {formatDate(alert.extra.breach_period_end)} :{" "}
          <b>{formatTimer(maxBreakLengthInSeconds)}</b>
        </span>
      );
    }
    case ALERT_TYPES.maximumWorkedDaysInWeek: {
      const maxBreakLengthInSeconds = alert.extra.rest_duration_s;
      const tooManyDays = alert.extra.too_many_days;
      const restDurationText = (
        <>
          Durée du repos hebdomadaire :{" "}
          <b>{formatTimer(maxBreakLengthInSeconds)}</b>.
        </>
      );
      const tooManyDaysText = (
        <>La semaine ne comporte aucune journée non travaillée.</>
      );
      if (tooManyDays && !maxBreakLengthInSeconds) {
        return (
          <>
            {tooManyDaysText}
            <br />
            Le repos hebdomadaire a été respecté.
          </>
        );
      }
      if (!tooManyDays && maxBreakLengthInSeconds) {
        return (
          <>
            {restDurationText}
            <br />
            Le nombre maximal de jours de travail par semaine civile a été
            respecté.
          </>
        );
      }

      return (
        <>
          {restDurationText}
          <br />
          {tooManyDaysText}
        </>
      );
    }
    case ALERT_TYPES.maximumUninterruptedWorkTime: {
      const uninterruptedWorkTime =
        alert.extra.longest_uninterrupted_work_in_seconds;
      return (
        <span>
          Durée du temps de travail ininterrompu constaté :{" "}
          <b>{formatTimer(uninterruptedWorkTime)}</b> entre le{" "}
          {formatDate(alert.extra.longest_uninterrupted_work_start)} et le{" "}
          {formatDate(alert.extra.longest_uninterrupted_work_end)}
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
          de travail de <b>{formatTimer(workTimeInSeconds)}</b> effectuée entre
          le {formatDate(alert.extra.work_range_start)} et le{" "}
          {formatDate(alert.extra.work_range_end)}
        </span>
      );
    }
    case ALERT_TYPES.maximumWorkDayTime: {
      const nightWork = alert.extra.night_work;
      const workTime = alert.extra.work_range_in_seconds;
      return (
        <span>
          Temps de travail total effectué entre le{" "}
          {formatDate(alert.extra.work_range_start)} et le{" "}
          {formatDate(alert.extra.work_range_end)}
          {nightWork ? " et comprenant du travail de nuit" : ""}
          {" : "}
          <b>{formatTimer(workTime)}</b>
        </span>
      );
    }
    case ALERT_TYPES.maximumWorkInCalendarWeek: {
      const {
        work_duration_in_seconds,
        work_range_start,
        work_range_end
      } = alert.extra;
      return (
        <span>
          Temps de travail total effectué entre le{" "}
          {formatDate(work_range_start)} et le {formatDate(work_range_end)} :{" "}
          <b>{formatTimer(work_duration_in_seconds)}</b>
          <b></b>
        </span>
      );
    }
    case ALERT_TYPES.enoughBreak: {
      const {
        not_enough_break,
        too_much_uninterrupted_work_time
      } = alert.extra;

      let uninterruptedJsx = undefined;
      if (too_much_uninterrupted_work_time) {
        const uninterruptedWorkTime =
          alert.extra.longest_uninterrupted_work_in_seconds;
        uninterruptedJsx = (
          <span>
            Durée du temps de travail ininterrompu :{" "}
            <b>{formatTimer(uninterruptedWorkTime)}</b>.{" "}
          </span>
        );
      }

      let breakJsx = "";
      if (not_enough_break) {
        const breakTimeInSeconds = alert.extra.total_break_time_in_seconds;
        const workTimeInSeconds = alert.extra.work_range_in_seconds;
        breakJsx = (
          <span>
            Durée du temps de pause :{" "}
            <b>{formatMinutesFromSeconds(breakTimeInSeconds)}</b> pour une
            amplitude journalière de <b>{formatTimer(workTimeInSeconds)}</b>{" "}
            effectuée entre le {formatDate(alert.extra.work_range_start)} et le{" "}
            {formatDate(alert.extra.work_range_end)}.
          </span>
        );
      }
      return (
        <>
          {uninterruptedJsx}
          {breakJsx}
        </>
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
  onChangeTab,
  readOnlyAlerts
}) {
  const { isReportingInfractions, onUpdateInfraction } = useInfractions();
  return (
    <Stack direction="row" spacing={2} alignItems="baseline" flexWrap="nowrap">
      {!readOnlyAlerts && isReportable && (
        <Checkbox
          disabled={!isReportingInfractions}
          options={[
            {
              label: "",
              nativeInputProps: {
                name: "",
                checked: alert.checked,
                onChange: e => {
                  const alertDate = alert.day || alert.week || alert.month;
                  onUpdateInfraction(sanction, alertDate, e.target.checked);
                }
              }
            }
          ]}
        />
      )}
      <div style={{ width: "100%" }}>
        {onChangeTab ? (
          <Link
            onClick={e => {
              e.preventDefault();
              onChangeTab("history");
              if (setPeriodOnFocus) {
                setPeriodOnFocus(
                  alert.day || alert.week || alert.month
                    ? mapValues(alert, date =>
                        isoFormatLocalDate(parseInt(date))
                      )
                    : alert
                );
              }
            }}
            to="/"
          >
            {formatAlertPeriod(alert, type)}
          </Link>
        ) : (
          <div>{formatAlertPeriod(alert, type)}</div>
        )}
        <div>{formatAlertText(alert, type)}</div>
      </div>
    </Stack>
  );
}
