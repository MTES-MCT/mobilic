import { createModalManager } from "./createModalManager";

let serverShouldUpdatePassword = false;

const passwordManager = createModalManager({
  cookieBaseName: "nextUpdatePasswordTime",
  defaultDelayDays: 3,
  isPerCompany: false,
  businessCondition: () => serverShouldUpdatePassword
});

export const onLogIn = shouldUpdatePassword => {
  serverShouldUpdatePassword = shouldUpdatePassword;

  if (!shouldUpdatePassword) {
    passwordManager.clearUpdateTimeCookie();
  } else {
    if (!passwordManager.checkUpdateTimeCookieExists()) {
      passwordManager.initUpdateTimeCookie();
    }
  }
};

export const shouldUpdatePassword = passwordManager.shouldUpdate;
export const snooze = passwordManager.snooze;
export const clearUpdateTimeCookie = passwordManager.clearUpdateTimeCookie;
export const checkUpdateTimeCookieExists =
  passwordManager.checkUpdateTimeCookieExists;
export const initUpdateTimeCookie = passwordManager.initUpdateTimeCookie;
