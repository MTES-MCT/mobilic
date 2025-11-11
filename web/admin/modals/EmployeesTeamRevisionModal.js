import React from "react";
import Grid from "@mui/material/Grid";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { NO_TEAMS_LABEL, NO_TEAM_ID } from "../utils/teams";
import Modal from "../../common/Modal";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { CHANGE_EMPLOYEE_TEAM } from "common/utils/apiQueries/employments";

export default function EmployeesTeamRevisionModal({
  employment,
  teams,
  adminStore,
  open,
  handleClose
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [newTeamId, setNewTeamId] = React.useState(
    employment.teamId || NO_TEAM_ID
  );
  const alerts = useSnackbarAlerts();
  const api = useApi();

  async function updateTeam() {
    setSubmitting(true);
    await alerts.withApiErrorHandling(async () => {
      const payload = {
        companyId: employment.companyId,
        userId: employment.userId
      };
      if (newTeamId !== NO_TEAM_ID) {
        payload.teamId = newTeamId;
      }
      if (employment.userId) {
        payload.userId = employment.userId;
      } else {
        payload.employmentId = employment.employmentId;
      }
      const apiResponse = await api.graphQlMutate(
        CHANGE_EMPLOYEE_TEAM,
        payload
      );
      const { teams, employments } =
        apiResponse?.data?.employments?.changeEmployeeTeam ?? {};
      if (teams && employments) {
        adminStore.dispatch({
          type: ADMIN_ACTIONS.updateTeams,
          payload: { teams, employments }
        });
        alerts.success(`L'affectation a bien été mise à jour.`, "", 6000);
      }
      handleClose();
    }, "update-team");
    setSubmitting(false);
  }

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title={`Modifier l'affectation de groupe du salarié${
        employment.name ? " " + employment.name : ""
      }`}
      content={
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <InputLabel id="select-team-label">{`Veuillez sélectionner un nouveau groupe pour le salarié${
              employment.name ? " " + employment.name : ""
            }`}</InputLabel>
            <Select
              labelId="select-team-label"
              id="select-team"
              value={newTeamId}
              onChange={(e) => setNewTeamId(e.target.value)}
              renderValue={(val) =>
                teams.find((team) => team.id === val)?.name || NO_TEAMS_LABEL
              }
            >
              <MenuItem value={NO_TEAM_ID}>{NO_TEAMS_LABEL}</MenuItem>
              {teams.map((team) => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      }
      actions={
        <>
          <Button priority="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <LoadingButton
            disabled={newTeamId === (employment.teamId || NO_TEAM_ID)}
            onClick={updateTeam}
            loading={submitting}
          >
            Confirmer
          </LoadingButton>
        </>
      }
    />
  );
}
