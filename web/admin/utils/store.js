import React from "react";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import flatMap from "lodash/flatMap";

const AdminStoreContext = React.createContext(() => {});

export function AdminStoreProvider({ children }) {
  const store = useStoreSyncedWithLocalStorage();

  const [users, setUsers] = React.useState([]);
  const [workDays, setWorkDays] = React.useState([]);
  const [vehicles, setVehicles] = React.useState([]);
  const [knownAddresses, setKnownAddresses] = React.useState([]);
  const [employments, setEmployments] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [missions, setMissions] = React.useState([]);
  const [minWorkDaysCursor, setMinWorkDaysCursor] = React.useState(null);

  const sync = (companiesPayload, minDate) => {
    const primaryCompany = store.companies().find(c => c.isPrimary);
    setCompanies(
      companiesPayload.map(c => ({
        id: c.id,
        name: c.name,
        siren: c.siren,
        settings: c.settings,
        isPrimary: primaryCompany ? c.id === primaryCompany.id : false
      }))
    );
    setUsers(
      flatMap(
        companiesPayload.map(c => c.users.map(u => ({ ...u, companyId: c.id })))
      )
    );
    addWorkDays(companiesPayload, minDate, true);
    setVehicles(
      flatMap(
        companiesPayload.map(c =>
          c.vehicles.map(v => ({ ...v, companyId: c.id }))
        )
      )
    );
    setKnownAddresses(
      flatMap(
        companiesPayload.map(c =>
          c.knownAddresses.map(a => ({ ...a, companyId: c.id }))
        )
      )
    );
    setEmployments(
      flatMap(
        companiesPayload.map(c =>
          c.employments.map(e => ({
            ...e,
            companyId: c.id,
            company: { id: c.id, name: c.name, siren: c.siren }
          }))
        )
      )
    );
    const newMissionIds = flatMap(
      companiesPayload.map(c => c.missions.edges.map(m => m.id))
    );
    setMissions(missions => [
      ...missions.filter(m => !newMissionIds.includes(m.id)),
      ...flatMap(
        companiesPayload.map(c =>
          c.missions.edges.map(m => ({ ...m.node, companyId: c.id }))
        )
      )
    ]);
  };

  function addWorkDays(companiesPayload, minDate, reset = false) {
    let actualMinCursor = minDate;
    companiesPayload.forEach(c => {
      const wds = c.workDays;
      if (wds.pageInfo.hasNextPage) {
        const oldestWorkDay = wds.edges[wds.edges.length - 1].node;
        const oldestCursor = `${oldestWorkDay.day}${oldestWorkDay.user.id}`;
        actualMinCursor =
          oldestCursor > actualMinCursor ? oldestCursor : actualMinCursor;
      }
    });
    const actualMinDate = actualMinCursor.slice(0, 10);
    const actualMinUser = actualMinCursor.slice(10);

    const actualMaxDate =
      !reset && minWorkDaysCursor ? minWorkDaysCursor.slice(0, 10) : null;
    const actualMaxUser =
      !reset && minWorkDaysCursor ? minWorkDaysCursor.slice(10) : null;

    const workDaysToAdd = flatMap(
      companiesPayload.map(c =>
        c.workDays.edges.map(wd => ({ ...wd.node, companyId: c.id }))
      )
    ).filter(
      wd =>
        (!actualMaxDate ||
          wd.day < actualMaxDate ||
          (wd.day === actualMaxDate &&
            wd.user.id.toString() < actualMaxUser)) &&
        (wd.day > actualMinDate ||
          (wd.day === actualMinDate && wd.user.id.toString() >= actualMinUser))
    );

    setWorkDays(wds => [...(reset ? [] : wds), ...workDaysToAdd]);
    setMinWorkDaysCursor(actualMinCursor);
  }

  return (
    <AdminStoreContext.Provider
      value={{
        companies: companies,
        setCompanies,
        userId: store.userId(),
        users,
        setUsers,
        workDays,
        setWorkDays,
        vehicles,
        setVehicles,
        knownAddresses,
        setKnownAddresses,
        employments,
        setEmployments,
        missions,
        setMissions,
        sync,
        addWorkDays,
        minWorkDaysDate: minWorkDaysCursor
          ? minWorkDaysCursor.slice(0, 10)
          : null
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export const useAdminStore = () => React.useContext(AdminStoreContext);
