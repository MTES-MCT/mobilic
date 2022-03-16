import { DAY, getStartOfDay, now } from "common/utils/time";
import {
  ADMIN_COMPANIES_LIST_QUERY,
  ADMIN_COMPANIES_QUERY
} from "common/utils/apiQueries";
import { sortBy } from "lodash/collection";

export async function loadCompaniesData(api, userId, minDate, companyId) {
  const companiesListResponse = await api.graphQlQuery(
    ADMIN_COMPANIES_LIST_QUERY,
    {
      id: userId
    }
  );

  const sortedCompaniesByName = sortBy(
    companiesListResponse.data.user.adminedCompanies,
    "name"
  );

  const companyIds = companyId ? [companyId] : [sortedCompaniesByName[0].id];

  const companyResponse = await api.graphQlQuery(
    ADMIN_COMPANIES_QUERY,
    {
      id: userId,
      activityAfter: minDate,
      workDaysLimit: 10000,
      endedMissionsAfter: getStartOfDay(now() - DAY * 31),
      companyIds
    },
    { context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 } }
  );
  return {
    allAdminedCompanies: companiesListResponse.data.user.adminedCompanies,
    selectedAdminedCompanies: companyResponse.data.user.adminedCompanies
  };
}
