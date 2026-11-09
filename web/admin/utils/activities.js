import { ADMIN_ACTIONS } from "../store/reducers/root";
import { loadCompanyWorkDaysAndMissions } from "./loadCompaniesData";

const WORK_DAYS_PAGE_SIZE = 50;
let latestRequestId = 0;

export async function loadActivitiesData({
  adminStore,
  alerts,
  api,
  withLoadingScreen,
  minDate = adminStore.activitiesFilters.minDate,
  maxDate = adminStore.activitiesFilters.maxDate,
  reset = true,
  userIds = null,
}) {
  const userId = adminStore.userId;
  const companyId = adminStore.companyId;
  if (userId && companyId) {
    // The cursor paginates backward in time anchored on maxDate: changing
    // maxDate invalidates it (reset), but minDate only moves the lower
    // bound the backend stops at - it doesn't invalidate the cursor, so it
    // is intentionally excluded from this comparison.
    const canReuseCursor =
      !reset && adminStore.workDaysFetchRange?.maxDate === maxDate;

    const requestId = ++latestRequestId;

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
              {
                first: WORK_DAYS_PAGE_SIZE,
                after: canReuseCursor
                  ? adminStore.workDaysPageInfo?.endCursor
                  : null,
                userIds,
              },
            );

            if (requestId !== latestRequestId) {
              return;
            }

            adminStore.dispatch({
              type: ADMIN_ACTIONS.addWorkDays,
              payload: {
                companiesPayload: companyData,
                minDate,
                maxDate,
                reset,
              },
            });
            adminStore.dispatch({
              type: ADMIN_ACTIONS.addUsers,
              payload: { companiesPayload: companyData },
            });
          },
          "load-company-data",
          null,
        ),
      { cacheKey: "loadActivities" + companyId },
    );
  }
}
