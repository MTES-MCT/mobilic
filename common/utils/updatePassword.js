import { clearCookie, readCookie, setCookie } from "./cookie";
import { addDaysToDate } from "./time";

const UPDATE_TIME_COOKIE_NAME = "nextUpdatePasswordTime";

export const shouldUpdatePassword = () => {
  if (!checkUpdateTimeCookieExists()) {
    return false;
  }
  const nextTime = new Date(readCookie(UPDATE_TIME_COOKIE_NAME)).getTime();
  const nowTime = new Date().getTime();
  return nowTime > nextTime;
};

export const onLogIn = shouldUpdatePassword => {
  if (!shouldUpdatePassword) {
    clearUpdateTimeCookie();
  } else {
    if (!checkUpdateTimeCookieExists()) {
      initUpdateTimeCookie();
    }
  }
};

export const clearUpdateTimeCookie = () =>
  clearCookie(UPDATE_TIME_COOKIE_NAME, true);

export const checkUpdateTimeCookieExists = () =>
  !!readCookie(UPDATE_TIME_COOKIE_NAME);

export const initUpdateTimeCookie = () => setTime(new Date());

export const snooze = () => {
  if (!checkUpdateTimeCookieExists()) {
    return;
  }
  setTime(addDaysToDate(new Date(), 3));
};

const setTime = newTime => setCookie(UPDATE_TIME_COOKIE_NAME, newTime, true);
