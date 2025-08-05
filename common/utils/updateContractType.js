import { clearCookie, readCookie, setCookie } from "./cookie";
import { addDaysToDate } from "./time";

const UPDATE_CONTRACT_TYPE_COOKIE_NAME = "nextUpdateContractTypeTime";
const SNOOZE_DELAY = 15;

export const shouldDisplayContractTypeModal = () => {
  if (!checkUpdateContractTypeCookieExists()) {
    return true;
  }
  const nextTime = new Date(
    readCookie(UPDATE_CONTRACT_TYPE_COOKIE_NAME)
  ).getTime();
  const nowTime = new Date().getTime();
  return nowTime > nextTime;
};

export const clearUpdateContractTypeCookie = () =>
  clearCookie(UPDATE_CONTRACT_TYPE_COOKIE_NAME, true);

export const checkUpdateContractTypeCookieExists = () =>
  !!readCookie(UPDATE_CONTRACT_TYPE_COOKIE_NAME);

export const snoozeContractType = () => {
  setTime(addDaysToDate(new Date(), SNOOZE_DELAY));
};

const setTime = newTime =>
  setCookie(UPDATE_CONTRACT_TYPE_COOKIE_NAME, newTime, true);
