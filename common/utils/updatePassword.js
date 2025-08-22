import { createUpdateTimeManager } from "./updateTimeManager";

const {
  checkUpdateTimeCookieExists,
  clearUpdateTimeCookie,
  snooze: snoozeBase,
  shouldUpdate,
  initUpdateTimeCookie
} = createUpdateTimeManager("nextUpdatePasswordTime", 3);

export const shouldUpdatePassword = () => {
  return shouldUpdate(false); // Returns false if no cookie exists
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

export const snooze = () => {
  if (!checkUpdateTimeCookieExists()) {
    return;
  }
  snoozeBase(3); // 3 days delay for password
};

export {
  clearUpdateTimeCookie,
  checkUpdateTimeCookieExists,
  initUpdateTimeCookie
};
