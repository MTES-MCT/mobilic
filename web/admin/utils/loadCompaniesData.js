import {
  ADMIN_COMPANIES_LIST_QUERY,
  ADMIN_COMPANIES_QUERY
} from "common/utils/apiQueries/admin";
import { DAY, getStartOfDay, now } from "common/utils/time";
import { sortBy } from "lodash/collection";

export async function loadCompaniesList(api, userId) {
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

  return sortedCompaniesByName;
}

export async function loadCompanyDetails(api, userId, minDate, companyId) {
  const companyIds = [companyId];

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

  return companyResponse.data.user.adminedCompanies;
}
