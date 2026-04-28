import flatMap from "lodash/flatMap";

export function addWorkDaysReducer(
  state,
  { companiesPayload, minDate, reset = false }
) {
  let actualMinCursor = minDate;
  companiesPayload.forEach((c) => {
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

  let workDaysToAdd = flatMap(
    companiesPayload.map((c) =>
      c.workDays.edges.map((wd) => ({ ...wd.node, companyId: c.id }))
    )
  ).filter(
    (wd) =>
      (!actualMaxDate ||
        wd.day < actualMaxDate ||
        (wd.day === actualMaxDate && wd.user.id.toString() < actualMaxUser)) &&
      (wd.day > actualMinDate ||
        (wd.day === actualMinDate && wd.user.id.toString() >= actualMinUser))
  );

  const regulationComputationsByUserAndByDay = flatMap(
    companiesPayload.map((c) => c.adminRegulationComputationsByUserAndByDay)
  );

  workDaysToAdd = workDaysToAdd.map((wd) => {
    const userId = wd.user.id;
    const day = wd.day;
    const computation = regulationComputationsByUserAndByDay.find(
      (rc) => rc.day === day && rc.userId === userId
    );

    return {
      ...wd,
      regulationComputations: computation
        ? {
            nbAlertsDailyAdmin: computation.nbAlertsDailyAdmin,
            nbAlertsWeeklyAdmin: computation.nbAlertsWeeklyAdmin
          }
        : undefined
    };
  });

  // Update missions if present in the payload
  let missions = state.missions;
  if (companiesPayload.some(c => c.missions)) {
    const newMissions = flatMap(
      companiesPayload.map(c =>
        c.missions && c.missions.edges
          ? c.missions.edges.map(m => ({
              ...m.node,
              companyId: c.id,
              isDeleted: false
            }))
          : []
      )
    );
    
    if (reset) {
      missions = newMissions;
    } else {
      // Merge and deduplicate (keep new ones)
      const existingMissionIds = new Set(newMissions.map(m => m.id));
      const filteredOldMissions = state.missions.filter(m => !existingMissionIds.has(m.id));
      missions = [...filteredOldMissions, ...newMissions];
    }
  }

  return {
    ...state,
    workDays: [...(reset ? [] : state.workDays), ...workDaysToAdd],
    missions,
    minWorkDaysCursor: actualMinCursor
  };
}
