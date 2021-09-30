import DateFnsUtils from "@date-io/date-fns";
import format from "date-fns/format";

export const DAY = 86400;
export const WEEK = 7 * 86400;
export const HOUR = 3600;
export const MINUTE = 60;
export const SHORT_MONTHS = [
  "jan",
  "fev",
  "mar",
  "avr",
  "mai",
  "juin",
  "juil",
  "aou",
  "sep",
  "oct",
  "nov",
  "dec"
];
const MONTHS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "décembre"
];

export const SHORT_DAYS = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

export const DAYS = [
  "dimanche",
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi"
];

export const LONG_BREAK_DURATION = 10 * HOUR;

export function formatTimer(timerDuration) {
  if (!timerDuration && timerDuration !== 0) return null;
  const timerDurationInMinutes = (timerDuration / 60) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${timerDurationInHours}h${addZero(timerDurationInMinutes % 60)}`;
}

export function formatTimerWithSeconds(timerDuration) {
  if (!timerDuration && timerDuration !== 0) return null;
  const timerDurationInMinutes = (timerDuration / 60) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${timerDurationInHours}h${addZero(
    timerDurationInMinutes % 60
  )}m${addZero(timerDuration % 60)}`;
}

export function formatLongTimer(timerDuration) {
  if (!timerDuration && timerDuration !== 0) return null;
  const timerDurationInMinutes = (timerDuration / 60) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${
    timerDurationInHours ? timerDurationInHours + " heures" : ""
  } ${timerDurationInMinutes % 60} minutes`;
}

export function formatWarningDurationTime(timerDurationInSeconds) {
  if (!timerDurationInSeconds && timerDurationInSeconds !== 0) return null;
  const timerDurationInMinutes = (timerDurationInSeconds / 60) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  if (timerDurationInHours > 0) {
    return `${timerDurationInHours} heures`;
  } else if (timerDurationInMinutes > 0) {
    return `${timerDurationInMinutes} minutes`;
  }
  return `${timerDurationInSeconds} secondes`;
}

export function formatTimeOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return `${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

function _localFormatDate(date, withYear = false) {
  return date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: withYear ? "numeric" : undefined
  });
}

export function formatDay(unixTimestamp, withYear = false) {
  const date = new Date(unixTimestamp * 1000);
  return _localFormatDate(date, withYear);
}

export function formatDayOfWeek(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return SHORT_DAYS[date.getDay()];
}

export function prettyFormatDay(unixTimestamp, withYear = false) {
  const date = new Date(unixTimestamp * 1000);
  const baseString = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return withYear ? `${baseString} ${date.getFullYear()}` : baseString;
}

export function prettyFormatMonth(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function shortPrettyFormatDay(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

export function textualPrettyFormatDay(unixTimestamp, withYear = false) {
  const date = new Date(unixTimestamp * 1000);
  const baseString = `${DAYS[date.getDay()]} ${date.getDate()} ${
    MONTHS[date.getMonth()]
  }`;
  return withYear ? `${baseString} ${date.getFullYear()}` : baseString;
}

export function textualPrettyFormatWeek(startOfWeek) {
  const date = new Date(startOfWeek * 1000);
  return `Semaine du ${_localFormatDate(date)} au ${_localFormatDate(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + 6)
  )}`;
}

export function isoFormatDateTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )}T${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDateTime(unixTimestamp, showYear = false) {
  const date = new Date(unixTimestamp * 1000);
  return `${date.toLocaleDateString(undefined, {
    month: "2-digit",
    day: "2-digit",
    year: showYear ? "numeric" : undefined
  })} ${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function addZero(n) {
  return n < 10 ? "0" + n : n;
}

export function getStartOfWeek(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const dayOfWeek = date.getDay();
  const daysToSubstract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const sameTimeAtStartOfWeek = new Date(
    (unixTimestamp - daysToSubstract * DAY) * 1000
  );
  return startOfDay(sameTimeAtStartOfWeek);
}

export function getStartOfMonth(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  date.setDate(1);
  return startOfDay(date);
}

export function startOfDayAsDate(date) {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
}

export function getEndOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  date.setHours(23);
  date.setMinutes(59);
  date.setSeconds(59);
  return (date.getTime() / 1000) >> 0;
}

export function startOfDay(date) {
  return (startOfDayAsDate(date).getTime() / 1000) >> 0;
}

export function getStartOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return startOfDay(date);
}

export class FrLocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMM", { locale: this.locale });
  }

  getDateTimePickerHeaderText(date) {
    return format(date, "d MMM", { locale: this.locale });
  }
}

export function truncateMinute(unixTimestamp) {
  return unixTimestamp - (unixTimestamp % 60);
}

export function now() {
  return (Date.now() / 1000) >> 0;
}

export function frenchFormatDateStringOrTimeStamp(isoDateString) {
  return new Date(isoDateString).toLocaleDateString();
}

export function endOfMonthAsDate(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfMonthAsDate(date) {
  date.setDate(1);
  return date;
}

export function isoFormatLocalDate(date) {
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )}`;
}

export function sameMinute(unixTimestamp1, unixTimestamp2) {
  return (
    new Date(unixTimestamp1 * 1000).toISOString().slice(0, 16) ===
    new Date(unixTimestamp2 * 1000).toISOString().slice(0, 16)
  );
}
