import { DAY, getStartOfDay, now } from "common/utils/time";
import { ADMIN_COMPANIES_QUERY } from "common/utils/apiQueries";

export async function loadCompaniesData(api, userId, minDate) {
  const companyResponse = await api.graphQlQuery(
    ADMIN_COMPANIES_QUERY,
    {
      id: userId,
      activityAfter: minDate,
      workDaysLimit: 10000,
      endedMissionsAfter: getStartOfDay(now() - DAY * 31)
    },
    { context: { timeout: process.env.REACT_APP_TIMEOUT || 60000 } }
  );
  return companyResponse.data.user.adminedCompanies;
}
