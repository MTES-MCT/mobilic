import { COMPANY_QUERY } from "../../common/utils/api";

export async function loadCompanyData(api, companyId) {
  const companyResponse = await api.graphQlQuery(COMPANY_QUERY, {
    id: companyId
  });
  const company = companyResponse.data.company;
  const usersWithWorkDays = company.users;
  let users = [];
  let workDays = [];
  usersWithWorkDays.forEach(u => {
    users.push({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName
    });
    u.workDays.forEach(wd => workDays.push({ userId: u.id, ...wd }));
  });
  return { users, workDays, vehicles: company.vehicles };
}
