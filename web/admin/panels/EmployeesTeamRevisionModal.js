import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import { LoadingButton } from "common/components/LoadingButton";
import { CHANGE_EMPLOYEE_TEAM } from "common/utils/apiQueries";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";
import { ADMIN_ACTIONS } from "../store/reducers/root";

const useStyles = makeStyles(theme => ({
  modalButton: {
    marginLeft: theme.spacing(2)
  }
}));

const NO_TEAMS_LABEL = "Aucune équipe";

export default function EmployeesTeamRevisionModal({
  employment,
  teams,
  adminStore,
  open,
  handleClose
}) {
  const [submitting, setSubmitting] = React.useState(false);
  const [newTeamId, setNewTeamId] = React.useState(employment.teamId || -1);
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const api = useApi();

  async function updateTeam() {
    setSubmitting(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(CHANGE_EMPLOYEE_TEAM, {
        teamId: newTeamId,
        employmentId: employment.employmentId
      });
      const {
        teams,
        employments
      } = apiResponse?.data?.employments?.changeEmployeeTeam;
      adminStore.dispatch({
        type: ADMIN_ACTIONS.updateTeams,
        payload: { teams, employments }
      });
      alerts.success(`L'affectation a bien été mise à jour.`, "", 6000);
      handleClose();
    }, "update-team");
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <CustomDialogTitle
        title={`Modifier l'affectation d'équipe du salarié${
          employment.name ? " " + employment.name : ""
        }`}
        handleClose={handleClose}
      />
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <InputLabel id="select-team-label">{`Veuillez sélectionner une nouvelle équipe pour le salarié${
              employment.name ? " " + employment.name : ""
            }`}</InputLabel>
            <Select
              labelId="select-team-label"
              id="select-team"
              value={newTeamId}
              onChange={e => setNewTeamId(e.target.value)}
              renderValue={val =>
                teams.find(team => team.id === val)?.name || NO_TEAMS_LABEL
              }
            >
              <MenuItem value={-1}>{NO_TEAMS_LABEL}</MenuItem>
              {teams.map(team => (
                <MenuItem key={team.id} value={team.id}>
                  {team.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>
      </DialogContent>
      <CustomDialogActions>
        <Button
          className={classes.modalButton}
          title="Annuler"
          onClick={handleClose}
        >
          Annuler
        </Button>
        <LoadingButton
          className={classes.modalButton}
          title="Confirmer"
          color="primary"
          variant="contained"
          disabled={newTeamId === (employment.teamId || -1)}
          onClick={updateTeam}
          loading={submitting}
        >
          Confirmer
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
