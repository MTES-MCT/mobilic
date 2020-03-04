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
  if (!timerDuration) return null;
  const timerDurationInMinutes = (timerDuration / 60000) >> 0;
  const timerDurationInHours = (timerDurationInMinutes / 60) >> 0;
  return `${timerDurationInHours}h${"\u00A0"}${addZero(
    timerDurationInMinutes % 60
  )}m`;
}

export function formatTimeOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}`;
}

export function prettyFormatDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
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
  return Math.floor((unixTimestamp - daysToSubstract * DAY) / DAY) * DAY;
}

export function getStartOfDay(unixTimestamp) {
  const date = new Date(unixTimestamp);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date.getTime();
}
