import { DAY, getStartOfDay, isoFormatLocalDate, now } from "common/utils/time";
import { ADMIN_COMPANIES_QUERY } from "common/utils/apiQueries";

export async function loadCompaniesData(api, userId) {
  const companyResponse = await api.graphQlQuery(ADMIN_COMPANIES_QUERY, {
    id: userId,
    activityAfter: isoFormatLocalDate(new Date(Date.now() - DAY * 1000 * 150)),
    workDaysLimit: 10000,
    nonValidatedMissionsAfter: getStartOfDay(now() - DAY * 31)
  });
  return companyResponse.data.user.adminedCompanies;
}
