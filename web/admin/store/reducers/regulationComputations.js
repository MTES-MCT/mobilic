const getKeyComputation = (rc) => `${rc.day}_${rc.userId}`;
const getKeyWorkDay = (wd) => `${wd.day}_${wd.user.id}`;

export function updateRegulationComputationsReducer(
  state,
  { computationRegulationsPayload }
) {
  const computationsMap = new Map(
    computationRegulationsPayload.map((rc) => [getKeyComputation(rc), rc])
  );
  return {
    ...state,
    workDays: state.workDays.map((wd) => {
      const computation = computationsMap.get(getKeyWorkDay(wd));
      if (!computation) {
        return wd;
      }
      return {
        ...wd,
        regulationComputations: {
          nbAlertsDailyAdmin: computation.nbAlertsDailyAdmin,
          nbAlertsWeeklyAdmin: computation.nbAlertsWeeklyAdmin
        }
      };
    })
  };
}
