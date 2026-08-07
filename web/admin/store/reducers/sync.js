import flatMap from "lodash/flatMap";
import { addWorkDaysReducer } from "./workDays";

export function updateCompanyIdReducer(state, { companyId }) {
  const isNewCompany = companyId !== state.companyId;
  return {
    ...state,
    companyId,
    areMissionsActivitiesLoaded: isNewCompany
      ? false
      : state.areMissionsActivitiesLoaded,
    areCompanyEssentialsLoaded: isNewCompany
      ? false
      : state.areCompanyEssentialsLoaded,
    areEmploymentsLoaded: isNewCompany ? false : state.areEmploymentsLoaded,
    areTeamsLoaded: isNewCompany ? false : state.areTeamsLoaded
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

export function updateShouldForceNbWorkerInfoReducer(
  state,
  { shouldForceNbWorkerInfo }
) {
  return {
    ...state,
    shouldForceNbWorkerInfo
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
      phoneNumber: c.phoneNumber,
      nbWorkers: c.nbWorkers
    }))
  };
}

export function updateCompanyNameAndPhoneNumberReducer(state, action) {
  const {
    companyId,
    companyName,
    companyPhoneNumber,
    companyNbWorkers
  } = action;

  const updatedCompanies = state.companies.map(({ id, ...rest }) => {
    if (id !== companyId) {
      return { id, ...rest };
    }

    return {
      id,
      ...rest,
      name: companyName,
      phoneNumber: companyPhoneNumber,
      ...(companyNbWorkers !== undefined && { nbWorkers: companyNbWorkers })
    };
  });

  return {
    ...state,
    companies: updatedCompanies
  };
}

export function updateCompanyNbWorkerSnoozeReducer(state, action) {
  const { companyId, snoozeNbWorkerDate } = action;

  const updatedCompanies = state.companies.map(({ id, ...rest }) => {
    if (id !== companyId) {
      return { id, ...rest };
    }

    return {
      id,
      ...rest,
      snoozeNbWorkerDate
    };
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

  return {
    ...state,
    users,
    currentUsers,
    employments: allEmployments,
    vehicles: flatMap(
      companiesPayload.map(c =>
        c.vehicles.map(v => ({ ...v, companyId: c.id }))
      )
    ),
    settings: companiesPayload[0].settings,
    pendingValidationsCount:
      companiesPayload[0].dashboardSummary?.pendingValidationsCount || 0,
    areCompanyEssentialsLoaded: true,
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
    activitiesFilters: {
      ...state.activitiesFilters,
      minDate
    }
  };
}

export function updateCompanyActivitiesReducer(state, { companiesData, minDate }) {
  return addWorkDaysReducer(state, {
    companiesPayload: companiesData,
    minDate,
    reset: true
  });
}

export const updateCompanyEmploymentsReducer = (state, { companiesPayload }) => {
  const allEmployments = flatMap(
    companiesPayload.map(c =>
      c.employments.map(e => ({
        ...e,
        companyId: c.id,
        company: { id: c.id, name: c.name, siren: c.siren }
      }))
    )
  );

  return {
    ...state,
    employments: allEmployments,
    areEmploymentsLoaded: true
  };
};

export const updatePendingValidationsCountReducer = (state, { count }) => {
  return {
    ...state,
    pendingValidationsCount: count
  };
};

export const updateCompanyTeamsReducer = (state, { teams }) => {
  return {
    ...state,
    teams,
    areTeamsLoaded: true
  };
};
