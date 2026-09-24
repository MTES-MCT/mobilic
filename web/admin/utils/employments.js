import { ADMIN_ACTIONS } from "../store/reducers/root";
import { loadCompanyEmployments } from "./loadCompaniesData";

export async function loadEmploymentsData({
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
            const companiesPayload = await loadCompanyEmployments(
              api,
              userId,
              companyId
            );
            adminStore.dispatch({
              type: ADMIN_ACTIONS.updateCompanyEmployments,
              payload: { companiesPayload }
            });
          },
          "load-company-employments",
          null
        ),
      { cacheKey: "loadEmployments" + companyId }
    );
  }
}
