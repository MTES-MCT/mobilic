import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { adminRootReducer } from "./reducers/root";
import { getStartOfMonth, isoFormatLocalDate, now } from "common/utils/time";

export const VIRTUAL_ACTIVITIES_ACTIONS = {
  create: { backendVerb: "log" },
  edit: { backendVerb: "edit" },
  cancel: { backendVerb: "cancel" }
};

export const VIRTUAL_EXPENDITURES_ACTIONS = {
  create: "create",
  cancel: "cancel"
};

const AdminStoreContext = React.createContext(() => {});

export function AdminStoreProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();

  const [state, setState] = React.useState({
    companyId: undefined,
    employmentId: undefined,
    shouldSeeCertificateInfo: false,
    shouldForceNbWorkerInfo: false,
    users: [],
    workDays: [],
    vehicles: [],
    settings: [],
    knownAddresses: [],
    employments: [],
    companies: [],
    missions: [],
    minWorkDaysCursor: [],
    activitiesFilters: {
      period: "day",
      users: [],
      maxDate: isoFormatLocalDate(new Date(Date.now())),
      minDate: isoFormatLocalDate(getStartOfMonth(now()))
    },
    validationsFilters: {
      users: [],
      teams: []
    },
    exportFilters: {
      users: [],
      teams: []
    },
    virtualActivities: [],
    virtualExpenditureActions: [],
    originalMissions: []
  });

  function dispatch(action) {
    setState(st => adminRootReducer(st, action));
  }

  return (
    <AdminStoreContext.Provider
      value={{
        ...state,
        userId: store.userId(),
        minWorkDaysDate: state.minWorkDaysCursor
          ? state.minWorkDaysCursor.slice(0, 10)
          : null,
        dispatch
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export const useAdminStore = () => React.useContext(AdminStoreContext);

export const useAdminCompanies = () => {
  const adminStore = useAdminStore();

  const [company, setCompany] = React.useState(null);
  const [sortedCompanies, setSortedCompanies] = React.useState([]);

  const companies = adminStore.companies;

  React.useEffect(() => {
    if (adminStore.companyId && companies && companies.length > 0) {
      setCompany(companies.find(c => c.id === adminStore.companyId));
      setSortedCompanies(
        companies.sort((c1, c2) =>
          c1.name.localeCompare(c2.name, undefined, {
            numeric: true,
            sensitivity: "base"
          })
        )
      );
    } else {
      setCompany(null);
    }
  }, [companies, adminStore.companyId]);

  return [sortedCompanies, company];
};
