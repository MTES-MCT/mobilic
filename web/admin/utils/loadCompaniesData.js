import { DAY, getStartOfDay, now } from "common/utils/time";
import { ADMIN_COMPANIES_QUERY } from "common/utils/apiQueries";

export async function loadCompaniesData(api, userId, minDate, companyId) {
  const companyResponse = await api.graphQlQuery(
    ADMIN_COMPANIES_QUERY,
    {
      id: userId,
      activityAfter: minDate,
      workDaysLimit: 10000,
      endedMissionsAfter: getStartOfDay(now() - DAY * 31),
      onlyFirst: companyId === undefined,
      companyIds: [companyId]
    },
    { context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 } }
  );
  return {
    allAdminedCompanies:
      companyResponse.data.allAdminedCompanies.adminedCompanies,
    selectedAdminedCompanies:
      companyResponse.data.selectedAdminedCompanies.adminedCompanies
  };
}
