import { COMPANY_QUERY } from "common/utils/api";
// import { DAY } from "common/utils/time";

export async function loadCompanyData(api, companyId) {
  const companyResponse = await api.graphQlQuery(COMPANY_QUERY, {
    id: companyId,
    activityAfter: "2019-07-01"
  });
  const company = companyResponse.data.company;
  return {
    users: company.users,
    workDays: company.workDays,
    vehicles: company.vehicles,
    employments: company.employments
  };
}
