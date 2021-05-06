import DateFnsUtils from "@date-io/date-fns";
import format from "date-fns/format";

export const DAY = 86400;
export const WEEK = 7 * 86400;
export const HOUR = 3600;
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

const SHORT_DAYS = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

export const LONG_BREAK_DURATION = 10 * HOUR;

export function formatTimer(timerDuration) {
  if (!timerDuration && timerDuration !== 0) return null;
  const timerDurationInMinutes = (timerDuration / 60) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${timerDurationInHours}h${addZero(timerDurationInMinutes % 60)}`;
}

export function formatLongTimer(timerDuration) {
  if (!timerDuration && timerDuration !== 0) return null;
  const timerDurationInMinutes = (timerDuration / 60) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${
    timerDurationInHours ? timerDurationInHours + " heures" : ""
  } ${timerDurationInMinutes % 60} minutes`;
}

export function formatTimeOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return `${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDay(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return date.toLocaleDateString();
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

export function isoFormatDateTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )}T${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDateTime(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  return `${date.toLocaleDateString()} ${addZero(date.getHours())}:${addZero(
    date.getMinutes() % 60
  )}`;
}

function addZero(n) {
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

export function startOfDay(date) {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return (date.getTime() / 1000) >> 0;
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

export function frenchFormatDateString(isoDateString) {
  return new Date(isoDateString).toLocaleDateString();
}
