import { ADMIN_ACTIONS } from "../store/reducers/root";
import { loadCompanyTeams } from "./loadCompaniesData";

export const NO_TEAM_ID = -1;
export const NO_TEAMS_LABEL = "Aucun groupe";

export async function loadTeamsData({ adminStore, alerts, api, withLoadingScreen }) {
  const companyId = adminStore.companyId;
  if (companyId) {
    await withLoadingScreen(
      async () =>
        await alerts.withApiErrorHandling(
          async () => {
            const teams = await loadCompanyTeams(api, companyId);
            adminStore.dispatch({
              type: ADMIN_ACTIONS.updateCompanyTeams,
              payload: { teams }
            });
          },
          "load-company-teams",
          null
        )
    );
  }
}
