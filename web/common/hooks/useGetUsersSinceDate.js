import React from "react";
import { ADMIN_USERS_SINCE_DATE } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../../admin/store/store";
import { isoFormatLocalDate } from "common/utils/time";

export const useGetUsersSinceDate = () => {
  const api = useApi();
  const adminStore = useAdminStore();
  const earliestDate = React.useRef(null);
  const memo = React.useRef(null);

  const getUsersSinceDate = async fromDate => {
    if (!earliestDate.current || fromDate < earliestDate.current) {
      const payload = await api.graphQlQuery(ADMIN_USERS_SINCE_DATE, {
        id: adminStore.userId,
        activityAfter: isoFormatLocalDate(fromDate),
        companyIds: [adminStore.companyId]
      });
      const users = payload?.data?.user?.adminedCompanies[0]?.users;
      earliestDate.current = fromDate;
      memo.current = users;
      return users;
    }
    return memo.current;
  };

  return { getUsersSinceDate };
};
