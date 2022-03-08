import flatMap from "lodash/flatMap";
import { addWorkDaysReducer } from "./workDays";

export function syncStoreReducer(state, { companiesPayload, minDate }) {
  console.log("syncStoreReducer", companiesPayload);
  const stateWithWorkDays = addWorkDaysReducer(state, {
    companiesPayload: companiesPayload.selectedAdminedCompanies,
    minDate,
    reset: true
  });
  const newMissionIds = flatMap(
    companiesPayload.selectedAdminedCompanies.map(c =>
      c.missions.edges.map(m => m.node.id)
    )
  );

  console.log(
    "companiesPayload.selectedAdminedCompanies[0].id",
    companiesPayload.selectedAdminedCompanies[0].id
  );
  return {
    ...stateWithWorkDays,
    companyId: companiesPayload.selectedAdminedCompanies[0].id,
    companies: companiesPayload.allAdminedCompanies.map(c => ({
      id: c.id,
      name: c.name,
      siren: c.siren,
      settings: c.settings
    })),
    users: flatMap(
      companiesPayload.selectedAdminedCompanies.map(c =>
        c.users.map(u => ({ ...u, companyId: c.id }))
      )
    ),
    vehicles: flatMap(
      companiesPayload.selectedAdminedCompanies.map(c =>
        c.vehicles.map(v => ({ ...v, companyId: c.id }))
      )
    ),
    knownAddresses: flatMap(
      companiesPayload.selectedAdminedCompanies.map(c =>
        c.knownAddresses.map(a => ({ ...a, companyId: c.id }))
      )
    ),
    employments: flatMap(
      companiesPayload.selectedAdminedCompanies.map(c =>
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
        companiesPayload.selectedAdminedCompanies.map(c =>
          c.missions.edges.map(m => ({ ...m.node, companyId: c.id }))
        )
      )
    ]
  };
}
