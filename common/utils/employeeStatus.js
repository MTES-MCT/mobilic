import { frenchFormatDateStringOrTimeStamp } from "./time";

export const NEVER_USED_MOBILIC_LABEL = "N'a jamais utilisé Mobilic";

export const formatLastActiveDate = lastActiveAt => {
  if (!lastActiveAt) return "";
  return frenchFormatDateStringOrTimeStamp(lastActiveAt * 1000);
};
