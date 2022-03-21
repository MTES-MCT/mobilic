import flatMap from "lodash/flatMap";
import { addWorkDaysReducer } from "./workDays";

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
      siren: c.siren,
      settings: c.settings
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

  return {
    ...stateWithWorkDays,
    users: flatMap(
      companiesPayload.map(c => c.users.map(u => ({ ...u, companyId: c.id })))
    ),
    vehicles: flatMap(
      companiesPayload.map(c =>
        c.vehicles.map(v => ({ ...v, companyId: c.id }))
      )
    ),
    settings: companiesPayload[0].settings,
    knownAddresses: flatMap(
      companiesPayload.map(c =>
        c.knownAddresses.map(a => ({ ...a, companyId: c.id }))
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
    ]
  };
}
