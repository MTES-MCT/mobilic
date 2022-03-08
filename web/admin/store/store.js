import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { adminRootReducer } from "./reducers/root";

const AdminStoreContext = React.createContext(() => {});

export function AdminStoreProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();

  const [state, setState] = React.useState({
    companyId: undefined,
    users: [],
    workDays: [],
    vehicles: [],
    knownAddresses: [],
    employments: [],
    companies: [],
    missions: [],
    minWorkDaysCursor: []
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
