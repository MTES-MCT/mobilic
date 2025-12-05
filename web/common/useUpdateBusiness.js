import { ADMIN_ACTIONS } from "../admin/store/reducers/root";
import { useAdminStore } from "../admin/store/store";
import { useSnackbarAlerts } from "./Snackbar";
import { formatApiError } from "common/utils/errors";
import { useApi } from "common/utils/api";
import { CHANGE_EMPLOYEE_BUSINESS_TYPE } from "common/utils/apiQueries/employments";

export const useUpdateEmployeeBusinessType = (employmentId, companyId) => {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();

  const udpateEmployeeBusinessType = async (businessType) => {
    try {
      const apiResponse = await api.graphQlMutate(
        CHANGE_EMPLOYEE_BUSINESS_TYPE,
        {
          employmentId,
          businessType
        }
      );
      const employments =
        apiResponse?.data?.employments?.changeEmployeeBusinessType?.employments;
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.update,
        payload: {
          id: employmentId,
          entity: "employments",
          update: {
            ...employments.find((employment) => employment.id === employmentId),
            companyId,
            adminStore
          }
        }
      });
    } catch (err) {
      alerts.error(formatApiError(err), employmentId, 6000);
    }
  };

  return { udpateEmployeeBusinessType };
};
