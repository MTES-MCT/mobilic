import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { CHANGE_EMPLOYEE_TEAM } from "common/utils/apiQueries/employments";

export function TeamDropdown({ employmentId, companyId, teamId, disabled = false }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();

  const handleChange = async (e) => {
    const newTeamId = e.target.value ? parseInt(e.target.value) : null;
    try {
      const apiResponse = await api.graphQlMutate(CHANGE_EMPLOYEE_TEAM, {
        companyId,
        employmentId,
        teamId: newTeamId
      });
      const { teams, employments } =
        apiResponse?.data?.employments?.changeEmployeeTeam ?? {};
      if (teams && employments) {
        await adminStore.dispatch({
          type: ADMIN_ACTIONS.updateTeams,
          payload: { teams, employments }
        });
        alerts.success("L'affectation a bien été mise à jour.", "", 6000);
      }
    } catch (err) {
      alerts.error(formatApiError(err), employmentId, 6000);
    }
  };

  return (
    <Select
      disabled={disabled}
      nativeSelectProps={{
        onChange: handleChange,
        value: teamId || ""
      }}
    >
      <option value="">-</option>
      {adminStore.teams?.map((team) => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ))}
    </Select>
  );
}
