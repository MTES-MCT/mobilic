import flatMap from "lodash/flatMap";
import { addWorkDaysReducer } from "./workDays";

export function syncStoreReducer(state, { companiesPayload, minDate }) {
  const stateWithWorkDays = addWorkDaysReducer(state, {
    companiesPayload,
    minDate,
    reset: true
  });
  const newMissionIds = flatMap(
    companiesPayload.map(c => c.missions.edges.map(m => m.node.id))
  );

  return {
    ...stateWithWorkDays,
    companies: companiesPayload.map(c => ({
      id: c.id,
      name: c.name,
      siren: c.siren,
      settings: c.settings
    })),
    users: flatMap(
      companiesPayload.map(c => c.users.map(u => ({ ...u, companyId: c.id })))
    ),
    vehicles: flatMap(
      companiesPayload.map(c =>
        c.vehicles.map(v => ({ ...v, companyId: c.id }))
      )
    ),
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
      ...stateWithWorkDays.missions.filter(m => !newMissionIds.includes(m.id)),
      ...flatMap(
        companiesPayload.map(c =>
          c.missions.edges.map(m => ({ ...m.node, companyId: c.id }))
        )
      )
    ]
  };
}
