import { DAY, frenchFormatDateStringOrTimeStamp, now } from "./time";

export const INACTIVITY_THRESHOLD_DAYS = 90;

export const isInactiveMoreThan3Months = lastActiveAt => {
  if (!lastActiveAt) return false;
  return now() - lastActiveAt > DAY * INACTIVITY_THRESHOLD_DAYS;
};

export const formatLastActiveDate = lastActiveAt => {
  if (!lastActiveAt) return "";
  return frenchFormatDateStringOrTimeStamp(lastActiveAt * 1000);
};
