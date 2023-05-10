import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "common/utils/TextField";
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
import { MultipleValuesFilter } from "./MultipleValuesFilter";
import { TeamEmployeesFilter } from "./TeamEmployeesFilter";
import { ADMIN_ACTIONS } from "../store/reducers/root";

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
  selectableKnownAddresses,
  selectableVehicles,
  setTeams,
  adminStore,
  open,
  handleClose
}) {
  const [name, setName] = React.useState(team?.name || "");
  const [submitting, setSubmitting] = React.useState(false);
  const [newAdmins, setNewAdmins] = React.useState([]);
  const [newUsers, setNewUsers] = React.useState([]);
  const [newKnownAddresses, setNewKnownAddresses] = React.useState([]);
  const [newVehicles, setNewVehicles] = React.useState([]);
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const api = useApi();

  React.useEffect(() => {
    selectableUsers.forEach(su => (su.selected = false));
    selectableAdmins.forEach(sa => (sa.selected = false));
    selectableKnownAddresses.forEach(sa => (sa.selected = false));
    selectableVehicles.forEach(sv => (sv.selected = false));
    setNewAdmins(
      selectableAdmins.map(sa => ({
        ...sa,
        selected: team
          ? team?.adminUsers?.some(au => au.id === sa.id)
          : sa.id === adminStore.userId
      }))
    );
    setNewUsers(
      selectableUsers.map(sa => ({
        ...sa,
        selected: team?.users?.some(au => au.id === sa.id)
      }))
    );
    setNewKnownAddresses(
      selectableKnownAddresses.map(sa => ({
        ...sa,
        selected: team?.knownAddresses?.some(au => au.id === sa.id)
      }))
    );
    setNewVehicles(
      selectableVehicles.map(sv => ({
        ...sv,
        selected: team?.vehicles?.some(v => v.id === sv.id)
      }))
    );
  }, []);

  const commonPayloadFromFields = () => {
    return {
      name: name,
      userIds: newUsers?.filter(u => u.selected).map(u => u.id),
      adminIds: newAdmins?.filter(u => u.selected).map(u => u.id),
      knownAddressIds: newKnownAddresses
        ?.filter(a => a.selected)
        .map(a => a.id),
      vehicleIds: newVehicles?.filter(v => v.selected).map(v => v.id)
    };
  };

  async function submitForm() {
    if (!team) {
      await createTeam();
    } else {
      await updateTeam();
    }
  }

  async function createTeam() {
    setSubmitting(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(CREATE_TEAM_MUTATION, {
        companyId: company.id,
        ...commonPayloadFromFields()
      });
      const { teams, employments } = apiResponse?.data?.teams?.createTeam;
      setTeams(teams);
      adminStore.dispatch({
        type: ADMIN_ACTIONS.updateTeams,
        payload: { teams, employments }
      });
      alerts.success(`Le groupe '${name}' a bien été créé.`, "", 6000);
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
      const { teams, employments } = apiResponse?.data?.teams?.updateTeam;
      setTeams(teams);
      adminStore.dispatch({
        type: ADMIN_ACTIONS.updateTeams,
        payload: { teams, employments }
      });
      alerts.success(`Le groupe '${name}' a bien été mis à jour.`, "", 6000);
      handleClose();
    }, "update-team");
    setSubmitting(false);
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <CustomDialogTitle
        title={
          !team ? "Créer un nouveau groupe" : `Modifier le groupe ${team?.name}`
        }
        handleClose={handleClose}
      />
      <DialogContent dividers>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Nom du groupe"
              variant="filled"
              inputProps={{
                maxLength: 255
              }}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TeamEmployeesFilter
              values={newAdmins}
              setValues={setNewAdmins}
              fieldLabel={"Gestionnaire(s) du groupe"}
            />
          </Grid>
          <Grid item xs={12}>
            <TeamEmployeesFilter
              values={newUsers}
              setValues={setNewUsers}
              fieldLabel={"Salarié(s) du groupe"}
            />
            <Alert severity="warning" className={classes.warningAffectation}>
              <Typography gutterBottom>
                Un salarié ne peut faire partie que d'un seul groupe à la fois.
                Lorsque vous affecterez un salarié au groupe, sa précédente
                affectation sera supprimée.
              </Typography>
            </Alert>
          </Grid>
          <Grid item xs={12}>
            <MultipleValuesFilter
              values={newKnownAddresses}
              setValues={setNewKnownAddresses}
              fieldLabel={"Adresse(s) associée(s)"}
              orderFields={["alias", "name"]}
              optionLabel={o => {
                return o.alias || o.name;
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <MultipleValuesFilter
              values={newVehicles}
              setValues={setNewVehicles}
              fieldLabel={"Véhicule(s) associé(s)"}
              orderFields={["alias", "registrationNumber"]}
              optionLabel={o => {
                return o.alias || o.registrationNumber;
              }}
            />
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
