import { useStoreSyncedWithLocalStorage } from "common/store/store";
import React from "react";

export const useIsAdmin = () => {
  const store = useStoreSyncedWithLocalStorage();
  const companies = store.companies();
  const userInfo = store.userInfo();

  const isAdmin = React.useMemo(
    () => userInfo?.id && companies?.some(c => c.admin),
    [userInfo, companies]
  );

  return { isAdmin };
};
