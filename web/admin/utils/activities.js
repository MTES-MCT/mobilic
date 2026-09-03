import { ADMIN_ACTIONS } from "../store/reducers/root";
import { loadCompanyWorkDaysAndMissions } from "./loadCompaniesData";

const WORK_DAYS_PAGE_SIZE = 10;

export async function loadActivitiesData({
  adminStore,
  alerts,
  api,
  withLoadingScreen,
  minDate = adminStore.activitiesFilters.minDate,
  maxDate = adminStore.activitiesFilters.maxDate,
  reset = true
}) {
  const userId = adminStore.userId;
  const companyId = adminStore.companyId;
  if (userId && companyId) {

    const isSameRange =
      !reset &&
      adminStore.workDaysFetchRange?.minDate === minDate &&
      adminStore.workDaysFetchRange?.maxDate === maxDate;

    await withLoadingScreen(
      async () =>
        await alerts.withApiErrorHandling(
          async () => {
            const companyData = await loadCompanyWorkDaysAndMissions(
              api,
              userId,
              minDate,
              maxDate,
              companyId,
              { first: WORK_DAYS_PAGE_SIZE, after: isSameRange ? adminStore.workDaysPageInfo?.endCursor : null }
            );
            adminStore.dispatch({
              type: ADMIN_ACTIONS.addWorkDays,
              payload: { companiesPayload: companyData, minDate, maxDate, reset }
            });
            adminStore.dispatch({
              type: ADMIN_ACTIONS.addUsers,
              payload: { companiesPayload: companyData }
            });
          },
          "load-company-data",
          null
        ),
      { cacheKey: "loadActivities" + companyId }
    );
  }
}
