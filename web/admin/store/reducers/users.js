import flatMap from "lodash/flatMap";
import uniqBy from "lodash/uniqBy";

export function addUsersReducer(state, { companiesPayload }) {
  const users = flatMap(
    companiesPayload.map(c => c.users.map(u => ({ ...u, companyId: c.id })))
  );
  const newUsers = uniqBy(users, u => u.id);

  return {
    ...state,
    users: newUsers,
    activitiesFilters: { ...state.activitiesFilters, users: newUsers }
  };
}
