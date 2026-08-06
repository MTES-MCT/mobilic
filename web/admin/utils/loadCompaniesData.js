import {
  ADMIN_COMPANIES_LIST_QUERY,
  ADMIN_COMPANIES_QUERY,
  ADMIN_EMPLOYMENTS_QUERY,
  ADMIN_PENDING_VALIDATIONS_COUNT_QUERY,
  ADMIN_WORK_DAYS_QUERY
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

export async function loadCompanyEssentials(api, userId, minDate, maxDate, companyId) {
  const companyIds = [companyId];

  const companyResponse = await api.graphQlQuery(
    ADMIN_COMPANIES_QUERY,
    {
      id: userId,
      activityAfter: minDate,
      companyIds
    },
    { context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 } }
  ).catch((error) => {
    console.error("Error loading company essentials data:", error);
    throw error;
  });

  return companyResponse.data.user.adminedCompanies;
}

export async function loadPendingValidationsCount(api, userId, companyId) {
  const response = await api.graphQlQuery(
    ADMIN_PENDING_VALIDATIONS_COUNT_QUERY,
    {
      id: userId,
      companyIds: [companyId]
    }
  ).catch((error) => {
    console.error("Error loading pending validations count:", error);
    throw error;
  });

  return (
    response.data.user.adminedCompanies[0]?.dashboardSummary
      ?.pendingValidationsCount ?? 0
  );
}

export async function loadCompanyEmployments(api, userId, companyId) {
  const response = await api.graphQlQuery(
    ADMIN_EMPLOYMENTS_QUERY,
    {
      id: userId,
      companyIds: [companyId]
    }
  ).catch((error) => {
    console.error("Error loading company employments:", error);
    throw error;
  });

  return response.data.user.adminedCompanies;
}

// loadCompanyWorkDaysAndMissions is used to load data for a specific company, including work days and missions, based on the provided date range.
// It returns the admined companies data for the specified user and company.
export const loadCompanyWorkDaysAndMissions = async (api, userId, minDate, maxDate, companyId) => {
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

  const companieData = await api.graphQlQuery(
    ADMIN_WORK_DAYS_QUERY,
    {
      id: userId,
      activityAfter: minDate,
      activityBefore: maxDate,
      endedMissionsAfter: minMissionTimestamp,
      endedMissionsBefore: maxMissionTimestamp,
      companyIds
    },
    { context: { timeout: process.env.REACT_APP_TIMEOUT_MS || 60000 } }
  ).catch((error) => {
    console.error("Error loading company work days and missions:", error);
    throw error;
  });
  return companieData.data.user.adminedCompanies;
}