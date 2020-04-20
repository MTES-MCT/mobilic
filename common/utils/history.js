export function findMatchingPeriodInNewScale(
  oldPeriod,
  newPeriods,
  oldPeriodScale,
  newPeriodScale
) {
  let mostRecentNewPeriodIndex = 0;
  let newPeriod;
  while (
    mostRecentNewPeriodIndex < newPeriods.length - 1 &&
    newPeriods[mostRecentNewPeriodIndex] > oldPeriod
  ) {
    mostRecentNewPeriodIndex++;
  }
  if (
    oldPeriod === newPeriods[mostRecentNewPeriodIndex] ||
    mostRecentNewPeriodIndex === newPeriods.length - 1 ||
    mostRecentNewPeriodIndex === 0 ||
    newPeriodScale > oldPeriodScale
  ) {
    newPeriod = newPeriods[mostRecentNewPeriodIndex];
  } else newPeriod = newPeriods[mostRecentNewPeriodIndex - 1];
  return newPeriod;
}
