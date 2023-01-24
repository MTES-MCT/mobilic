import { clearCookie, readCookie, setCookie } from "./cookie";
import { addDaysToDate } from "./time";

const UPDATE_TIME_COOKIE_NAME = "nextUpdatePasswordTime";

export const onLogIn = shouldUpatePassword => {
  if (!shouldUpatePassword) {
    clear();
  } else {
    if (!exists()) {
      init();
    }
  }
};

export const clear = () => clearCookie(UPDATE_TIME_COOKIE_NAME);

export const exists = () => !!readCookie(UPDATE_TIME_COOKIE_NAME);

export const init = () => setTime(new Date());

export const snooze = () => {
  if (!exists()) {
    return;
  }
  setTime(addDaysToDate(new Date(), 3));
};

const setTime = newTime => setCookie(UPDATE_TIME_COOKIE_NAME, newTime);
