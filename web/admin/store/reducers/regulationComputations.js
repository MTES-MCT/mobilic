export function updateRegulationComputationsReducer(
  state,
  { computationRegulationsPayload }
) {
  return {
    ...state,
    workDays: state.workDays.map((wd) => {
      const computation = computationRegulationsPayload.find(
        (rc) => rc.day === wd.day && rc.userId === wd.user.id
      );
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
