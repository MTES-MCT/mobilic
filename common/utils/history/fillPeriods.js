import {
  DAY,
  getStartOfMonth,
  getStartOfWeek,
  HOUR,
  now,
  startOfDay,
  WEEK
} from "../time";

export function fillHistoryPeriods(
  periods,
  step,
  startPeriodFilter,
  endPeriodFilter
) {
  if (!["day", "month", "week"].includes(step)) return periods;

  const allPeriods = [];
  let continuousPeriod;
  if (step === "week") {
    continuousPeriod = getStartOfWeek(startPeriodFilter.getTime() / 1000);
  } else if (step === "month") {
    continuousPeriod = getStartOfMonth(startPeriodFilter.getTime() / 1000);
  } else {
    continuousPeriod = startOfDay(startPeriodFilter);
  }
  let continuousPeriodEnd = continuousPeriod;
  while (
    continuousPeriodEnd <= endPeriodFilter?.getTime() / 1000 &&
    continuousPeriodEnd < now()
  ) {
    if (step === "day") {
      continuousPeriodEnd = startOfDay(
        new Date((continuousPeriod + DAY + HOUR) * 1000)
      );
    } else if (step === "week") {
      continuousPeriodEnd = startOfDay(
        new Date((continuousPeriod + WEEK + HOUR) * 1000)
      );
    } else if (step === "month") {
      continuousPeriodEnd = getStartOfMonth(continuousPeriod + DAY * 32);
    }
    allPeriods.push(continuousPeriod);
    continuousPeriod = continuousPeriodEnd;
  }
  return allPeriods;
}
