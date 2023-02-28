import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "common/utils/TextField";
import { EmployeeFilter } from "../components/EmployeeFilter";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { LoadingButton } from "common/components/LoadingButton";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import {
  CREATE_TEAM_MUTATION,
  UPDATE_TEAM_MUTATION
} from "common/utils/apiQueries";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useApi } from "common/utils/api";

const useStyles = makeStyles(theme => ({
  modalButton: {
    marginLeft: theme.spacing(2)
  },
  warningAffectation: {
    marginTop: theme.spacing(1)
  }
}));

export default function CompanyTeamCreationRevisionModal({
  team,
  company,
  selectableUsers,
  selectableAdmins,
  setTeams,
  open,
  handleClose
}) {
  const [name, setName] = React.useState(team?.name || "");
  const [submitting, setSubmitting] = React.useState(false);
  const [newUsers, setNewUsers] = React.useState([]);
  const [newAdmins, setNewAdmins] = React.useState([]);
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const api = useApi();

  React.useEffect(() => {
    selectableUsers.forEach(su => (su.selected = false));
    selectableAdmins.forEach(sa => (sa.selected = false));
    setNewAdmins(
      selectableAdmins.map(sa => ({
        ...sa,
        selected: team?.adminUsers?.some(au => au.id === sa.id)
      }))
    );
    setNewUsers(
      selectableUsers.map(sa => ({
        ...sa,
        selected: team?.users?.some(au => au.id === sa.id)
      }))
    );
  }, []);

  const commonPayloadFromFields = () => {
    return {
      name: name,
      userIds: newUsers?.filter(u => u.selected).map(u => u.id),
      adminIds: newAdmins?.filter(u => u.selected).map(u => u.id)
    };
  };

  async function submitForm() {
    if (team) {
      await updateTeam();
    } else {
      await createTeam();
    }
  }

  async function createTeam() {
    setSubmitting(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(CREATE_TEAM_MUTATION, {
        companyId: company.id,
        ...commonPayloadFromFields()
      });
      setTeams(apiResponse?.data?.teams?.createTeam);
      alerts.success(`L'équipe '${name}' a bien été créée.`, "", 6000);
      handleClose();
    }, "create-team");
    setSubmitting(false);
  }

  async function updateTeam() {
    setSubmitting(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(UPDATE_TEAM_MUTATION, {
        teamId: team.id,
        ...commonPayloadFromFields()
      });
      setTeams(apiResponse?.data?.teams?.updateTeam);
      alerts.success(`L'équipe '${name}' a bien été mise à jour.`, "", 6000);
      handleClose();
    }, "update-team");
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <CustomDialogTitle
        title={
          !team
            ? "Créer une nouvelle équipe"
            : `Modifier l'équipe ${team?.name}`
        }
        handleClose={handleClose}
      />
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Nom de l'équipe"
              variant="filled"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <EmployeeFilter
              users={newAdmins}
              setUsers={setNewAdmins}
              noneSelectedLabel={"Gestionnaire(s) de l'équipe"}
              fullWidth
              limitTagNumber={5}
              componentSize={"medium"}
            />
          </Grid>
          <Grid item xs={12}>
            <EmployeeFilter
              users={newUsers}
              setUsers={setNewUsers}
              noneSelectedLabel={"Salarié(s) de l'équipe"}
              fullWidth
              limitTagNumber={5}
              componentSize={"medium"}
            />
            <Alert severity="warning" className={classes.warningAffectation}>
              <Typography gutterBottom>
                Un salarié ne peut faire partie que d'une seule équipe à la
                fois. Lorsque vous affecterez un salarié à l'équipe, sa
                précédente affectation sera supprimée.
              </Typography>
            </Alert>
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
          disabled={!name}
          onClick={submitForm}
          loading={submitting}
        >
          Confirmer
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
