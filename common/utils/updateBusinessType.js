import { createUpdateTimeManager } from "./updateTimeManager";

const {
  checkUpdateTimeCookieExists,
  clearUpdateTimeCookie,
  snooze,
  shouldUpdate
} = createUpdateTimeManager("nextUpdateBusinessTypeTime", 1);

export const shouldUpdateBusinessType = () => {
  return shouldUpdate(true);
};

export { clearUpdateTimeCookie, checkUpdateTimeCookieExists, snooze };
