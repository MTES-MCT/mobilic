import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const AdminStoreContext = React.createContext(() => {});

export function AdminStoreProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();

  const [users, setUsers] = React.useState([]);
  const [workDays, setWorkDays] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [employments, setEmployments] = React.useState([]);

  const sync = companyPayload => {
    setUsers(companyPayload.users || []);
    setWorkDays(companyPayload.workDays || []);
    setVehicles(companyPayload.vehicles || []);
    setEmployments(companyPayload.employments || []);
  };

  return (
    <AdminStoreContext.Provider
      value={{
        companyId: store.companyId(),
        userId: store.userId(),
        users,
        setUsers,
        workDays,
        setWorkDays,
        vehicles,
        setVehicles,
        employments,
        setEmployments,
        sync
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export const useAdminStore = () => React.useContext(AdminStoreContext);
