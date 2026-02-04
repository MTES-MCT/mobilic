import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { CHANGE_EMPLOYEE_ROLE } from "common/utils/apiQueries/employments";

export function AdminRightsDropdown({
  employmentId,
  companyId,
  hasAdminRights,
  disabled,
  isDetached = false
}) {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();

  const handleChange = async (e) => {
    const newValue = e.target.value === "true";
    try {
      const apiResponse = await api.graphQlMutate(CHANGE_EMPLOYEE_ROLE, {
        employmentId,
        hasAdminRights: newValue
      });
      const { teams, employments } =
        apiResponse?.data?.employments?.changeEmployeeRole ?? {};
      if (employments) {
        await adminStore.dispatch({
          type: ADMIN_ACTIONS.update,
          payload: {
            id: employmentId,
            entity: "employments",
            update: {
              ...employments.find((e) => e.id === employmentId),
              companyId,
              adminStore
            }
          }
        });
      }
      if (teams && employments) {
        await adminStore.dispatch({
          type: ADMIN_ACTIONS.updateTeams,
          payload: { teams, employments }
        });
      }
    } catch (err) {
      alerts.error(formatApiError(err), employmentId, 6000);
    }
  };

  return (
    <Select
      disabled={disabled || isDetached}
      nativeSelectProps={{
        onChange: handleChange,
        value: hasAdminRights ? "true" : "false"
      }}
    >
      <option value="true">Oui</option>
      <option value="false">Non</option>
    </Select>
  );
}
