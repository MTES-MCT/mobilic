import React from "react";
import { ADMIN_USERS_SINCE_DATE } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../../admin/store/store";
import { isoFormatLocalDate } from "common/utils/time";
import { useSnackbarAlerts } from "../Snackbar";
import { formatApiError } from "common/utils/errors";

export const useGetUsersSinceDate = () => {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const adminStore = useAdminStore();
  const earliestDate = React.useRef(null);
  const memo = React.useRef(null);

  const getUsersSinceDate = async fromDate => {
    if (!earliestDate.current || fromDate < earliestDate.current) {
      try {
        const payload = await api.graphQlQuery(ADMIN_USERS_SINCE_DATE, {
          id: adminStore.userId,
          activityAfter: isoFormatLocalDate(fromDate),
          companyIds: [adminStore.companyId]
        });
        const users = payload?.data?.user?.adminedCompanies[0]?.users;
        earliestDate.current = fromDate;
        memo.current = users;
        return users;
      } catch (err) {
        alerts.error(formatApiError(err), "get_users_since_date", 6000);
      }
    }
    return memo.current;
  };

  return { getUsersSinceDate };
};
