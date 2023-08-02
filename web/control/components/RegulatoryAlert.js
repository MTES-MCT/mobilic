import React from "react";
import mapValues from "lodash/mapValues";
import {
  isoFormatLocalDate,
  prettyFormatMonth,
  textualPrettyFormatDay,
  textualPrettyFormatWeek
} from "common/utils/time";
import { Link } from "../../common/LinkButton";

function formatAlertPeriod(alert) {
  if (alert.day) {
    return textualPrettyFormatDay(alert.day);
  }
  if (alert.week) {
    return textualPrettyFormatWeek(alert.week);
  }
  if (alert.month) {
    return prettyFormatMonth(alert.month);
  }
  return "Mission";
}

export function RegulatoryAlert({ alert, type, setPeriodOnFocus, setTab }) {
  return (
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
      {formatAlertPeriod(alert)}
    </Link>
  );
}
