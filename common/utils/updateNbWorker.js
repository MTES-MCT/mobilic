import { createModalManager } from "./createModalManager";

const nbWorkerManager = createModalManager({
  cookieBaseName: "nextUpdateNbWorkerTime",
  defaultDelayDays: 1,
  isPerCompany: true,
  businessCondition: company => !(company?.nbWorkers && company.nbWorkers > 0)
});

export const shouldUpdateNbWorker = nbWorkerManager.shouldUpdate;
export const snooze = nbWorkerManager.snooze;
export const clearUpdateTimeCookie = nbWorkerManager.clearUpdateTimeCookie;
export const checkUpdateTimeCookieExists =
  nbWorkerManager.checkUpdateTimeCookieExists;
