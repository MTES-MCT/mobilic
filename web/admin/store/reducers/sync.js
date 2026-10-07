import flatMap from "lodash/flatMap";
import { addWorkDaysReducer } from "./workDays";
import { computeWeeklyThresholdsByUserId } from "../../utils/weeklyThresholds";

export const preserveSelected = (newItems, existingItems) =>
  newItems.map(item => {
    const existing = existingItems?.find(e => e.id === item.id);
    return existing ? { ...item, selected: existing.selected } : item;
  });

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
  // companiesPayload[*].employments here is scoped to the current admin's
  // own employment (query uses `employments(latestPerUser: true, userIds:
  // [$id])`), not the full company roster - it is only used upstream to
  // derive the admin's own shouldSeeCertificateInfo/shouldForceNbWorkerInfo
  // flags. It must not overwrite state.employments, which
  // updateCompanyEmploymentsReducer maintains from the dedicated,
  // unrestricted employments query - otherwise whichever of the two
  // independently-triggered fetches resolves last wins, and the full
  // roster can get silently clobbered down to a single employment.

  return {
    ...state,
    users,
    currentUsers,
    vehicles: flatMap(
      companiesPayload.map(c =>
        c.vehicles.map(v => ({ ...v, companyId: c.id }))
      )
    ),
    settings: companiesPayload[0].settings,
    pendingValidationsCount:
      companiesPayload[0].dashboardSummary?.pendingValidationsCount || 0,
    areCompanyEssentialsLoaded: true,
    weeklyThresholds: companiesPayload[0].weeklyThresholds || null,
    // Derived from the full roster (state.employments, maintained by
    // updateCompanyEmploymentsReducer) rather than adminOwnEmployments:
    // per-employee threshold overrides must cover every employee, not just
    // the current admin.
    weeklyThresholdsByUserId: computeWeeklyThresholdsByUserId(
      state.employments
    ),
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
    areEmploymentsLoaded: true,
    weeklyThresholdsByUserId: computeWeeklyThresholdsByUserId(allEmployments)
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
