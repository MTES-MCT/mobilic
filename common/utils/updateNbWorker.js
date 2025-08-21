import { createUpdateTimeManager } from "./updateTimeManager";

const {
  checkUpdateTimeCookieExists,
  clearUpdateTimeCookie,
  snooze,
  shouldUpdate
} = createUpdateTimeManager("nextUpdateNbWorkerTime", 1);

export const shouldUpdateNbWorker = company => {
  const hasNbWorkers = company?.nbWorkers && company.nbWorkers > 0;
  return shouldUpdate(!hasNbWorkers);
};

export { clearUpdateTimeCookie, checkUpdateTimeCookieExists, snooze };
