import { ADMIN_ACTIONS } from "../store/reducers/root";
import { loadCompanyWorkDaysAndMissions } from "./loadCompaniesData";

// Pagination (first/after) is temporarily disabled - it could stall or loop
// on empty pages. Omitting first/after makes the backend return everything
// in one query instead (already supported).
export async function loadActivitiesData({
  adminStore,
  alerts,
  api,
  withLoadingScreen,
  reset = true,
}) {
  const userId = adminStore.userId;
  const companyId = adminStore.companyId;
  if (userId && companyId) {
    await withLoadingScreen(
      async () =>
        await alerts.withApiErrorHandling(
          async () => {
            const minDate = adminStore.activitiesFilters.minDate;
            const maxDate = adminStore.activitiesFilters.maxDate;
            const companyData = await loadCompanyWorkDaysAndMissions(
              api,
              userId,
              minDate,
              maxDate,
              companyId,
            );
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
