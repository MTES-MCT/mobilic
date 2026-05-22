import {
  ADMIN_COMPANIES_LIST_QUERY,
  ADMIN_COMPANIES_QUERY
} from "common/utils/apiQueries/admin";
import { getEndOfDay, startOfDay } from "common/utils/time";
import { sortBy } from "lodash/collection";

// 1 year limit
const MAX_DAYS_RANGE = 365;

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

export async function loadCompanyDetails(api, userId, minDate, maxDate, companyId) {
  const companyIds = [companyId];

  // Use inclusive day boundaries and cap to 1 year.
  const minMissionTimestamp = startOfDay(new Date(minDate));
  const selectedMaxMissionTimestamp = getEndOfDay(
    startOfDay(new Date(maxDate))
  );
  const maxMissionTimestamp = Math.min(
    selectedMaxMissionTimestamp,
    minMissionTimestamp + (MAX_DAYS_RANGE * 24 * 60 * 60) - 1
  );

  const companyResponse = await api.graphQlQuery(
    ADMIN_COMPANIES_QUERY,
    {
      id: userId,
      activityAfter: minDate,
      workDaysLimit: 10000,
      endedMissionsAfter: minMissionTimestamp,
      endedMissionsBefore: maxMissionTimestamp,
      companyIds
    },
    { context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 } }
  );

  return companyResponse.data.user.adminedCompanies;
}
