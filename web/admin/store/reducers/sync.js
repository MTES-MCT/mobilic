import flatMap from "lodash/flatMap";
import { addWorkDaysReducer } from "./workDays";
import { computeUsersAndTeamFilters } from "./team";

export function updateCompanyIdReducer(state, { companyId }) {
  return {
    ...state,
    companyId
  };
}

export function updateShouldSeeCertificateInfoReducer(
  state,
  { shouldSeeCertificateInfo }
) {
  return {
    ...state,
    shouldSeeCertificateInfo
  };
}

export function updateEmploymentIdReducer(state, { employmentId }) {
  return {
    ...state,
    employmentId
  };
}

export function updateCompaniesListReducer(state, { companiesPayload }) {
  return {
    ...state,
    companies: companiesPayload.map(c => ({
      id: c.id,
      name: c.name,
      siren: c.siren,
      phoneNumber: c.phoneNumber
    }))
  };
}

export function updateCompanyNameAndPhoneNumberReducer(state, action) {
  const { companyId, companyName, companyPhoneNumber } = action;

  const updatedCompanies = state.companies.map(({ id, ...rest }) => {
    if (id !== companyId) {
      return { id, ...rest };
    }

    return { id, ...rest, name: companyName, phoneNumber: companyPhoneNumber };
  });

  return {
    ...state,
    companies: updatedCompanies
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
  const currentUsers = flatMap(
    companiesPayload.map(c =>
      c.currentUsers.map(u => ({ ...u, companyId: c.id }))
    )
  );
  const allEmployments = flatMap(
    companiesPayload.map(c =>
      c.employments.map(e => ({
        ...e,
        companyId: c.id,
        company: { id: c.id, name: c.name, siren: c.siren }
      }))
    )
  );

  const teams = flatMap(
    companiesPayload.map(c => c.teams.map(t => ({ ...t, companyId: t.id })))
  );

  const usersAndTeamsFilters = computeUsersAndTeamFilters(
    users,
    allEmployments,
    teams
  );

  const regularMissions = flatMap(
    companiesPayload.map(c =>
      c.missions.edges.map(m => ({
        ...m.node,
        companyId: c.id,
        isDeleted: false
      }))
    )
  );
  const deletedMissions = flatMap(
    companiesPayload.map(c =>
      c.missionsDeleted.edges.map(m => ({
        ...m.node,
        companyId: c.id,
        isDeleted: true
      }))
    )
  );

  const missions = deletedMissions.concat(regularMissions);

  return {
    ...stateWithWorkDays,
    users,
    currentUsers,
    teams: teams,
    employments: allEmployments,
    vehicles: flatMap(
      companiesPayload.map(c =>
        c.vehicles.map(v => ({ ...v, companyId: c.id }))
      )
    ),
    settings: companiesPayload[0].settings,
    business: companiesPayload[0].business || {
      businessType: "",
      transportType: ""
    },
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
    missions,
    activitiesFilters: {
      ...state.activitiesFilters,
      teams: usersAndTeamsFilters.activitiesFilters.teams,
      users: usersAndTeamsFilters.activitiesFilters.users,
      minDate
    },
    validationsFilters: {
      ...state.validationsFilters,
      teams: usersAndTeamsFilters.validationsFilters.teams,
      users: usersAndTeamsFilters.validationsFilters.users
    },
    exportFilters: {
      ...state.exportFilters,
      teams: usersAndTeamsFilters.exportFilters.teams,
      users: usersAndTeamsFilters.exportFilters.users
    }
  };
}
