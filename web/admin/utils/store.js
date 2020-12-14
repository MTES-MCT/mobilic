import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import flatMap from "lodash/flatMap";

const AdminStoreContext = React.createContext(() => {});

export function AdminStoreProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();

  const [users, setUsers] = React.useState([]);
  const [workDays, setWorkDays] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [employments, setEmployments] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [missions, setMissions] = React.useState([]);

  const sync = companiesPayload => {
    const primaryCompany = store.companies().find(c => c.isPrimary);
    setCompanies(
      companiesPayload.map(c => ({
        id: c.id,
        name: c.name,
        isPrimary: primaryCompany ? c.id === primaryCompany.id : false
      }))
    );
    setUsers(
      flatMap(
        companiesPayload.map(c => c.users.map(u => ({ ...u, companyId: c.id })))
      )
    );
    setWorkDays(
      flatMap(
        companiesPayload.map(c =>
          c.workDays.map(wd => ({ ...wd, companyId: c.id }))
        )
      )
    );
    setVehicles(
      flatMap(
        companiesPayload.map(c =>
          c.vehicles.map(v => ({ ...v, companyId: c.id }))
        )
      )
    );
    setEmployments(
      flatMap(
        companiesPayload.map(c =>
          c.employments.map(e => ({
            ...e,
            companyId: c.id,
            company: { id: c.id, name: c.name }
          }))
        )
      )
    );
    setMissions(
      flatMap(
        companiesPayload.map(c =>
          c.missions.map(m => ({ ...m, companyId: c.id }))
        )
      )
    );
  };

  return (
    <AdminStoreContext.Provider
      value={{
        companies: companies,
        userId: store.userId(),
        users,
        setUsers,
        workDays,
        setWorkDays,
        vehicles,
        setVehicles,
        employments,
        setEmployments,
        missions,
        setMissions,
        sync
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export const useAdminStore = () => React.useContext(AdminStoreContext);
