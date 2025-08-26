import { createModalManager } from "./createModalManager";

const businessTypeManager = createModalManager({
  cookieBaseName: "nextUpdateBusinessTypeTime",
  defaultDelayDays: 1,
  isPerCompany: true,
  businessCondition: () => true
});

export const shouldUpdateBusinessType = businessTypeManager.shouldUpdate;
export const snooze = businessTypeManager.snooze;
export const clearUpdateTimeCookie = businessTypeManager.clearUpdateTimeCookie;
export const checkUpdateTimeCookieExists =
  businessTypeManager.checkUpdateTimeCookieExists;
