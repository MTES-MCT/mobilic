import { clearCookie, readCookie, setCookie } from "./cookie";
import { addDaysToDate } from "./time";

/**
 * Factory function to create update time management utilities
 * @param {string} cookieName - The name of the cookie to use
 * @param {number} defaultSnoozeDelay - Default snooze delay in days
 */
export function createUpdateTimeManager(cookieName, defaultSnoozeDelay = 1) {
  const checkUpdateTimeCookieExists = () => !!readCookie(cookieName);

  const clearUpdateTimeCookie = () => clearCookie(cookieName, true);

  const setTime = newTime => setCookie(cookieName, newTime, true);

  const snooze = (customDelay = defaultSnoozeDelay) => {
    setTime(addDaysToDate(new Date(), customDelay));
  };

  const shouldUpdate = (customCondition = null) => {
    if (customCondition !== null && !customCondition) {
      return false;
    }

    if (!checkUpdateTimeCookieExists()) {
      return customCondition !== null ? true : false;
    }

    const nextTime = new Date(readCookie(cookieName)).getTime();
    const nowTime = new Date().getTime();
    return nowTime > nextTime;
  };

  const initUpdateTimeCookie = () => setTime(new Date());

  return {
    checkUpdateTimeCookieExists,
    clearUpdateTimeCookie,
    snooze,
    shouldUpdate,
    initUpdateTimeCookie,
    setTime
  };
}
