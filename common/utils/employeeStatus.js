import { frenchFormatDateStringOrTimeStamp } from "./time";

export const formatLastActiveDate = lastActiveAt => {
  if (!lastActiveAt) return "";
  return frenchFormatDateStringOrTimeStamp(lastActiveAt * 1000);
};
