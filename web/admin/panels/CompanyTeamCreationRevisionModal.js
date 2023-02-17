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
import { CREATE_TEAM_MUTATION } from "common/utils/apiQueries";
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
  const [users, setUsers] = React.useState(team?.users);
  const [admins, setAdmins] = React.useState(
    team?.userAdmins || selectableAdmins
  );
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const api = useApi();

  React.useEffect(() => {
    if (team?.users) {
      team.users.forEach(existingUser => {
        const selectableUser = selectableUsers.find(
          su => su.id === existingUser.id
        );
        if (selectableUser) {
          selectableUser.selected = true;
        }
      });
    }
    if (team?.adminUsers) {
      team.adminUsers.forEach(existingAdmin => {
        const selectableAdmin = selectableAdmins.find(
          sa => sa.id === existingAdmin.id
        );
        if (selectableAdmin) {
          selectableAdmin.selected = true;
        }
      });
    }
  }, []);

  const commonPayloadFromFields = () => {
    return {
      name: name,
      userIds: users?.filter(u => u.selected).map(u => u.id),
      adminIds: admins?.filter(u => u.selected).map(u => u.id)
    };
  };

  async function createTeam() {
    setSubmitting(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(CREATE_TEAM_MUTATION, {
        companyId: company.id,
        ...commonPayloadFromFields()
      });
      setTeams(apiResponse?.data?.teams?.createTeam);
      alerts.success(`L'équipe '${name}' a bien été créée.`, "", 6000);
    }, "create-team");
    setSubmitting(false);
    handleClose();
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
              users={admins || selectableAdmins}
              setUsers={setAdmins}
              noneSelectedLabel={"Gestionnaire(s) de l'équipe"}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <EmployeeFilter
              users={users || selectableUsers}
              setUsers={setUsers}
              noneSelectedLabel={"Salarié(s) de l'équipe"}
              fullWidth
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
          onClick={createTeam}
          loading={submitting}
        >
          Confirmer
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
