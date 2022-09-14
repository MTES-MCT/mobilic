import flatMap from "lodash/flatMap";
import { addWorkDaysReducer } from "./workDays";
import uniqBy from "lodash/uniqBy";

export function updateCompanyIdReducer(state, { companyId }) {
  return {
    ...state,
    companyId
  };
}

export function updateCompaniesListReducer(state, { companiesPayload }) {
  return {
    ...state,
    companies: companiesPayload.map(c => ({
      id: c.id,
      name: c.name,
      siren: c.siren
    }))
  };
}

export function updateCompanyDetailsReducer(
  state,
  { companiesPayload, minDate }
) {
  const stateWithWorkDays = addWorkDaysReducer(state, {
    companiesPayload,
    minDate,
    reset: true
  });

  const users = flatMap(
    companiesPayload.map(c => c.users.map(u => ({ ...u, companyId: c.id })))
  );

  return {
    ...stateWithWorkDays,
    users,
    vehicles: flatMap(
      companiesPayload.map(c =>
        c.vehicles.map(v => ({ ...v, companyId: c.id }))
      )
    ),
    settings: companiesPayload[0].settings,
    knownAddresses: flatMap(
      companiesPayload.map(c =>
        c.knownAddresses
          .map(a => ({ ...a, companyId: c.id }))
          .sort((a1, a2) =>
            (a1.alias || a1.name).localeCompare(
              a2.alias || a2.name,
              undefined,
              {
                numeric: true,
                sensitivity: "base"
              }
            )
          )
      )
    ),
    employments: flatMap(
      companiesPayload.map(c =>
        c.employments.map(e => ({
          ...e,
          companyId: c.id,
          company: { id: c.id, name: c.name, siren: c.siren }
        }))
      )
    ),
    missions: [
      ...flatMap(
        companiesPayload.map(c =>
          c.missions.edges.map(m => ({ ...m.node, companyId: c.id }))
        )
      )
    ],
    activitiesFilters: {
      ...state.activitiesFilters,
      users: uniqBy(users, u => u.id),
      minDate
    }
  };
}
