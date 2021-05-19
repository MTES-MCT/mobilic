// The purpose of this function is to find the closest match to a period among periods on a different time scale
// This is to ensure that when user switches time scale the "time location" is not lost.
// Examples :
// - when switching from day to week the new period should be the week containing the current day
// - conversely, when switching from week to day, we decide (arbitrarily) that the new period should be the first (existing) day of the current week
import { getTime } from "./events";
import moment from "moment";
import { now } from "./time";

export function findMatchingPeriodInNewScale(
  oldPeriod, // the selected period on the old time scale
  newPeriods, // the list of periods on the new time scale
  oldPeriodLength,
  newPeriodLength
) {
  let mostRecentNewPeriodIndex = 0; // most recent relatively to the old period
  let newPeriod;
  // Find in the new periods the one whose start time is immediately before the old period
  while (
    mostRecentNewPeriodIndex < newPeriods.length - 1 &&
    newPeriods[mostRecentNewPeriodIndex + 1] <= oldPeriod
  ) {
    mostRecentNewPeriodIndex++;
  }
  // We want to use the most recent new period in the following cases :
  // 1) we have an exact match between the start time of the old period start time and the one of the most recent new period
  // 2) the old period's start time is after all the new start times --> the most recent new period is also the closest one
  // 3) the new time scale is coarser than the old one : the most recent period is the one enclosing the old period
  if (
    mostRecentNewPeriodIndex >= 0 &&
    (oldPeriod === newPeriods[mostRecentNewPeriodIndex] || // case 1
    mostRecentNewPeriodIndex === newPeriods.length - 1 || // case 2
      newPeriodLength.asSeconds() > oldPeriodLength.asSeconds()) // case 3
  ) {
    newPeriod = newPeriods[mostRecentNewPeriodIndex];
  } else newPeriod = newPeriods[mostRecentNewPeriodIndex + 1];
  return newPeriod;
}

export function groupMissionsByPeriod(missions, periodStart, periodLength) {
  const groups = {};
  const now1 = now();
  missions.forEach(mission => {
    const firstPeriod = periodStart(getTime(mission));
    const lastPeriod =
      periodLength.asSeconds() > 0
        ? periodStart(
            mission.activities[mission.activities.length - 1].endTime || now1
          )
        : firstPeriod;
    let currentPeriod = firstPeriod;
    while (currentPeriod <= lastPeriod) {
      if (!groups[currentPeriod]) groups[currentPeriod] = [];
      groups[currentPeriod].push(mission);
      currentPeriod = moment
        .unix(currentPeriod)
        .add(
          periodLength.asSeconds() > 0
            ? periodLength
            : moment.duration(1, "days")
        )
        .unix();
    }
  });
  return groups;
}
