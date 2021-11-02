import { DAY, getStartOfMonth, HOUR, startOfDay, WEEK } from "../time";

export function fillHistoryPeriods(periods, step) {
  if (!["day", "month", "week"].includes(step)) return periods;

  const allPeriods = [];
  let continuousPeriod = startOfDay(new Date(periods[0] * 1000));
  let index = 0;
  while (index <= periods.length - 1) {
    const currentActualPeriod = periods[index];
    if (continuousPeriod > currentActualPeriod) {
      allPeriods.push(currentActualPeriod);
      index = index + 1;
    } else {
      let continuousPeriodEnd;
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

      if (currentActualPeriod >= continuousPeriodEnd) {
        if (
          step !== "mission" ||
          ![0, 6].includes(new Date(continuousPeriod * 1000).getDay())
        )
          allPeriods.push(continuousPeriod);
      }
      continuousPeriod = continuousPeriodEnd;
    }
  }
  return allPeriods;
}
