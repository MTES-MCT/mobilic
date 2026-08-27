import { ADMIN_ACTIONS } from "../store/reducers/root";
import { loadCompanyWorkDaysAndMissions } from "./loadCompaniesData";

export async function loadActivitiesData({
  adminStore,
  alerts,
  api,
  withLoadingScreen
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
              companyId
            );
            adminStore.dispatch({
              type: ADMIN_ACTIONS.updateCompanyActivities,
              payload: { companiesData: companyData, minDate }
            });
          },
          "load-company-data",
          null
        ),
      { cacheKey: "loadActivities" + companyId }
    );
  }
}
