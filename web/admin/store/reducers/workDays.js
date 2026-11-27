import flatMap from "lodash/flatMap";

export function addWorkDaysReducer(
  state,
  { companiesPayload, minDate, maxDate, reset = false, userIds = null }
) {
  const rawWorkDays = flatMap(
    companiesPayload.map((c) =>
      c.workDays.edges.map((wd) => ({ ...wd.node, companyId: c.id }))
    )
  );

  const regulationComputationsByUserAndByDay = flatMap(
    companiesPayload.map((c) => c.adminRegulationComputationsByUserAndByDay)
  );

  const attachRegulationComputations = (wd) => {
    const computation = regulationComputationsByUserAndByDay.find(
      (rc) => rc.day === wd.day && rc.userId === wd.user.id
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
  };

  // Update missions if present in the payload. Note: the `missions` field
  // has no userIds filter, so its payload always covers the full date
  // range regardless of `userIds` - no per-user scoping needed here.
  let missions = state.missions;
  if (companiesPayload.some(c => c.missions)) {
    const newMissions = flatMap(
      companiesPayload.map(c =>
        c.missions?.edges
          ? c.missions.edges.map(m => ({
              ...m.node,
              companyId: c.id,
              isDeleted: false
            }))
          : []
      )
    );

    const newMissionIds = new Set(newMissions.map(m => m.id));
    if (reset) {
      const keptDeletedMissions = state.missions.filter(
        m => m.isDeleted && !newMissionIds.has(m.id)
      );
      missions = [...keptDeletedMissions, ...newMissions];
    } else {
      const filteredOldMissions = state.missions.filter(m => !newMissionIds.has(m.id));
      missions = [...filteredOldMissions, ...newMissions];
    }
  }

  // A userIds-scoped refresh (e.g. after validating one employee's
  // mission) only replaces that employee's work days, leaving everyone
  // else's rows - and the "load more" pagination cursor - untouched.
  if (userIds) {
    const workDaysToAdd = rawWorkDays.map(attachRegulationComputations);
    const keptWorkDays = state.workDays.filter(
      wd => !userIds.includes(wd.user.id)
    );
    return {
      ...state,
      workDays: [...keptWorkDays, ...workDaysToAdd],
      missions,
      areMissionsActivitiesLoaded: true
    };
  }

  let actualMinCursor = minDate;
  companiesPayload.forEach((c) => {
    const wds = c.workDays;
    if (wds.pageInfo.hasNextPage && wds.edges.length > 0) {
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

  // Parses the user id suffix of a cursor as a number ("10" > "9" numerically,
  // unlike as strings); an empty suffix (no cutoff known) maps to -Infinity.
  const userIdCursorToNumber = str =>
    str ? parseInt(str, 10) : -Infinity;
  const actualMaxUserNum = userIdCursorToNumber(actualMaxUser);
  const actualMinUserNum = userIdCursorToNumber(actualMinUser);

  const workDaysToAdd = rawWorkDays
    .filter(
      (wd) =>
        (!actualMaxDate ||
          wd.day < actualMaxDate ||
          (wd.day === actualMaxDate && wd.user.id < actualMaxUserNum)) &&
        (wd.day > actualMinDate ||
          (wd.day === actualMinDate && wd.user.id >= actualMinUserNum))
    )
    .map(attachRegulationComputations);

  return {
    ...state,
    workDays: [...(reset ? [] : state.workDays), ...workDaysToAdd],
    missions,
    minWorkDaysCursor: actualMinCursor,
    workDaysPageInfo: companiesPayload[0]?.workDays?.pageInfo ?? state.workDaysPageInfo,
    workDaysFetchRange: { minDate, maxDate },
    areMissionsActivitiesLoaded: true
  };
}
