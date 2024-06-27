import { clearCookie, readCookie, setCookie } from "./cookie";
import { addDaysToDate } from "./time";

const UPDATE_TIME_COOKIE_NAME = "nextUpdateBusinessTypeTime";
const SNOOZE_DELAY = 1;

export const shouldUpdateBusinessType = () => {
  if (!checkUpdateTimeCookieExists()) {
    return true;
  }
  const nextTime = new Date(readCookie(UPDATE_TIME_COOKIE_NAME)).getTime();
  const nowTime = new Date().getTime();
  return nowTime > nextTime;
};

export const clearUpdateTimeCookie = () =>
  clearCookie(UPDATE_TIME_COOKIE_NAME, true);

export const checkUpdateTimeCookieExists = () =>
  !!readCookie(UPDATE_TIME_COOKIE_NAME);

export const snooze = () => {
  setTime(addDaysToDate(new Date(), SNOOZE_DELAY));
};

const setTime = newTime => setCookie(UPDATE_TIME_COOKIE_NAME, newTime, true);
