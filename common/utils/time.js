import DateFnsUtils from "@date-io/date-fns";
import format from "date-fns/format";

export const DAY = 86400000;
export const WEEK = 7 * 86400000;
export const HOUR = 3600000;
const SHORT_MONTHS = [
  "janv",
  "fev",
  "mars",
  "avr",
  "mai",
  "juin",
  "juil",
  "aout",
  "sept",
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

export function formatTimer(timerDuration) {
  if (!timerDuration && timerDuration !== 0) return null;
  const timerDurationInMinutes = (timerDuration / 60000) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${timerDurationInHours}h${"\u00A0"}${addZero(
    timerDurationInMinutes % 60
  )}m`;
}

export function formatLongTimer(timerDuration) {
  if (!timerDuration && timerDuration !== 0) return null;
  const timerDurationInMinutes = (timerDuration / 60000) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${
    timerDurationInHours ? timerDurationInHours + " heures" : ""
  } ${timerDurationInMinutes % 60} minutes`;
}

export function formatTimeOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}`;
}

export function prettyFormatDay(unixTimestamp, withYear = false) {
  const date = new Date(unixTimestamp);
  const baseString = `${date.getDate()} ${MONTHS[date.getMonth()]}`;
  return withYear ? `${baseString} ${date.getFullYear()}` : baseString;
}

export function prettyFormatMonth(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function shortPrettyFormatDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

export function isoFormatDateTime(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(
    date.getDate()
  )}T${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDateTime(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${addZero(date.getDate())}/${addZero(
    date.getMonth() + 1
  )}/${date.getFullYear()} ${addZero(date.getHours())}:${addZero(
    date.getMinutes() % 60
  )}`;
}

function addZero(n) {
  return n < 10 ? "0" + n : n;
}

export function getStartOfWeek(unixTimestamp) {
  const date = new Date(unixTimestamp);
  const dayOfWeek = date.getDay();
  const daysToSubstract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const sameTimeAtStartOfWeek = new Date(unixTimestamp - daysToSubstract * DAY);
  return _startOfDay(sameTimeAtStartOfWeek);
}

export function getStartOfMonth(unixTimestamp) {
  const date = new Date(unixTimestamp);
  date.setDate(1);
  return _startOfDay(date);
}

function _startOfDay(date) {
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
}

export function getStartOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return _startOfDay(date);
}

export class FrLocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date) {
    return format(date, "d MMMM yyyy", { locale: this.locale });
  }
}
