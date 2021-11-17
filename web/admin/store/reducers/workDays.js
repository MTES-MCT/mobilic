import flatMap from "lodash/flatMap";

export function addWorkDaysReducer(
  state,
  { companiesPayload, minDate, reset = false }
) {
  let actualMinCursor = minDate;
  companiesPayload.forEach(c => {
    const wds = c.workDays;
    if (wds.pageInfo.hasNextPage) {
      const oldestWorkDay = wds.edges[wds.edges.length - 1].node;
      const oldestCursor = `${oldestWorkDay.day}${oldestWorkDay.user.id}`;
      actualMinCursor =
        oldestCursor > actualMinCursor ? oldestCursor : actualMinCursor;
    }
  });
  const actualMinDate = actualMinCursor.slice(0, 10);
  const actualMinUser = actualMinCursor.slice(10);

  const actualMaxDate =
    !reset && state.minWorkDaysCursor
      ? state.minWorkDaysCursor.slice(0, 10)
      : null;
  const actualMaxUser =
    !reset && state.minWorkDaysCursor
      ? state.minWorkDaysCursor.slice(10)
      : null;

  const workDaysToAdd = flatMap(
    companiesPayload.map(c =>
      c.workDays.edges.map(wd => ({ ...wd.node, companyId: c.id }))
    )
  ).filter(
    wd =>
      (!actualMaxDate ||
        wd.day < actualMaxDate ||
        (wd.day === actualMaxDate && wd.user.id.toString() < actualMaxUser)) &&
      (wd.day > actualMinDate ||
        (wd.day === actualMinDate && wd.user.id.toString() >= actualMinUser))
  );

  return {
    ...state,
    workDays: [...(reset ? [] : state.workDays), ...workDaysToAdd],
    minWorkDaysCursor: actualMinCursor
  };
}
