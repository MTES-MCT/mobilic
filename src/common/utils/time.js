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

export function formatTimeOfDay(unixDate) {
  const date = new Date(unixDate);
  return `${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDay(unixDate) {
  const date = new Date(unixDate);
  return `${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}`;
}

export function prettyFormatDay(unixDate) {
  const date = new Date(unixDate);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function shortPrettyFormatDay(unixDate) {
  const date = new Date(unixDate);
  return `${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

function addZero(n) {
  return n < 10 ? "0" + n : n;
}

export function getStartOfWeek(unixDate) {
  const date = new Date(unixDate);
  const dayOfWeek = date.getDay();
  const daysToSubstract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return Math.floor((unixDate - daysToSubstract * DAY) / DAY) * DAY;
}
