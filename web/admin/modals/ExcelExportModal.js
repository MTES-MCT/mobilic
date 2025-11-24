import React from "react";
import Typography from "@mui/material/Typography";
import { MobileDatePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import { useApi } from "common/utils/api";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import Grid from "@mui/material/Grid";
import { isoFormatLocalDate } from "common/utils/time";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { DateOrDateTimeRangeSelectionContext } from "common/components/DateOrDateTimeRangeSelectionContext";
import { CheckboxField } from "../../common/CheckboxField";
import { Autocomplete } from "@mui/lab";
import {
  getUsersToSelectFromTeamSelection,
  unselectAndGetAllTeams
} from "../store/reducers/team";
import Modal, { modalStyles } from "../../common/Modal";
import { TeamFilter } from "../components/TeamFilter";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Notice from "../../common/Notice";
import { useExportsContext } from "../utils/contextExports";

export const syncUsers = (setUsers, newUsers) => {
  setUsers(currentUsers => [
    ...currentUsers,
    ...newUsers.filter(
      newUser =>
        !currentUsers.map(currentUser => currentUser.id).includes(newUser.id)
    )
  ]);
};
export default function ExcelExportModal({
  open,
  handleClose,
  defaultCompany,
  companies = [],
  initialUsers,
  initialTeams,
  defaultMinDate = null,
  defaultMaxDate = null,
  getUsersSinceDate
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const { addExport } = useExportsContext();
  const [minDate, setMinDate] = React.useState(defaultMinDate);
  const [maxDate, setMaxDate] = React.useState(defaultMaxDate);
  const [isOneFileByEmployee, setIsOneFileByEmployee] = React.useState(false);

  const [selectedCompany, setSelectedCompany] = React.useState(defaultCompany);
  const [users, setUsers] = React.useState(initialUsers);
  const [teams, setTeams] = React.useState(initialTeams);

  const [isEnabledDownload, setIsEnabledDownload] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      if (minDate < defaultMinDate) {
        const newUsers = await getUsersSinceDate(minDate);
        syncUsers(setUsers, newUsers);
      }
    };
    load();
  }, [minDate]);

  React.useEffect(() => setIsEnabledDownload(true), [
    minDate,
    maxDate,
    isOneFileByEmployee,
    users,
    selectedCompany
  ]);

  const today = new Date();

  React.useEffect(() => {
    setMinDate(defaultMinDate);
    setMaxDate(defaultMaxDate);
  }, [open]);

  const handleUserFilterChange = newUsers => {
    const unselectedTeams = unselectAndGetAllTeams(teams);
    setTeams(unselectedTeams);
    setUsers(newUsers);
  };

  const handleTeamFilterChange = newTeams => {
    const usersToSelect = getUsersToSelectFromTeamSelection(newTeams, users);
    setUsers(usersToSelect);
    setTeams(newTeams);
  };

  const classes = modalStyles();

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Télécharger le rapport d'activité"
      size="lg"
      content={
        <>
          <Typography gutterBottom>
            Le rapport d'activité est un fichier Excel (.xlsx) qui contient les
            onglets suivants.
          </Typography>
          <ul>
            <li>
              <Typography>
                <strong>Activité</strong>, qui contient la liste des journées de
                travail avec toutes leurs informations : nom de la mission,
                véhicule utilisé, horaires et durées cumulées des activités de
                la journée, frais, ... . Cet onglet est presque identique à la
                vue <strong>Jour</strong> du tableau ci-derrière.
              </Typography>
            </li>
            <li>
              <Typography>
                <strong>Détails</strong>, qui contient l'historique des
                enregistrements et des modifications d'activité.
              </Typography>
            </li>
          </ul>
          <Typography variant="h5" className={classes.subtitle}>
            Options
          </Typography>
          <Notice
            type="warning"
            description="En cas d'export pour les agents de contrôle, veillez à ne pas
            modifier la mise en page du fichier avant envoi."
          />
          <Grid spacing={4} container className={classes.subtitle}>
            {companies.length > 1 && (
              <Grid item sm={6} className={classes.flexGrow}>
                <Autocomplete
                  size="small"
                  label="Entreprise"
                  options={companies}
                  defaultValue={defaultCompany}
                  getOptionLabel={c => c.name}
                  disableClearable
                  onChange={(_, newValue) => setSelectedCompany(newValue)}
                  renderInput={params => (
                    <TextField {...params} label="Entreprise" />
                  )}
                />
              </Grid>
            )}
            {teams?.length > 0 && (
              <Grid
                item
                className={classes.flexGrow}
                sm={companies.length > 1 ? 6 : 12}
              >
                <TeamFilter teams={teams} setTeams={handleTeamFilterChange} />
              </Grid>
            )}
            <Grid
              item
              className={classes.flexGrow}
              sm={companies.length > 1 ? 6 : 12}
            >
              <EmployeeFilter users={users} setUsers={handleUserFilterChange} />
            </Grid>
            <DateOrDateTimeRangeSelectionContext
              start={minDate}
              setStart={setMinDate}
              end={maxDate}
              setEnd={setMaxDate}
              nullableBounds
            >
              <Grid item sm={6}>
                <MobileDatePicker
                  label="Date de début"
                  value={minDate}
                  inputFormat="d MMMM yyyy"
                  onChange={setMinDate}
                  clearable
                  cancelText={null}
                  clearText="Annuler"
                  disableCloseOnSelect={false}
                  disableMaskedInput={true}
                  maxDate={today}
                  renderInput={props => (
                    <TextField {...props} variant="outlined" />
                  )}
                  slotProps={{
                    textField: {
                      size: "small"
                    }
                  }}
                />
              </Grid>
              <Grid item sm={6}>
                <MobileDatePicker
                  label="Date de fin"
                  value={maxDate}
                  inputFormat="d MMMM yyyy"
                  onChange={setMaxDate}
                  clearable
                  cancelText={null}
                  clearText="Annuler"
                  disableCloseOnSelect={false}
                  disableMaskedInput={true}
                  maxDate={today}
                  renderInput={props => (
                    <TextField {...props} variant="outlined" />
                  )}
                  slotProps={{
                    textField: {
                      size: "small"
                    }
                  }}
                />
              </Grid>
            </DateOrDateTimeRangeSelectionContext>
            <Grid item sm={12} className={classes.flexGrow}>
              <FormControl component="fieldset" variant="standard">
                <CheckboxField
                  checked={isOneFileByEmployee}
                  onChange={e => setIsOneFileByEmployee(e.target.checked)}
                  label="Générer un fichier unique par employé pour la période concernée"
                  required={false}
                />
              </FormControl>
            </Grid>
          </Grid>
          <Typography>
            En cas de téléchargement des données pour un grand nombre de
            salariés en une fois, plusieurs fichiers vous seront envoyés
            simultanément. Chacun contiendra les temps de travail d’un groupe de
            salariés. Le tri s’effectuera par ordre alphabétique.
          </Typography>
        </>
      }
      actions={
        <>
          <LoadingButton
            disabled={!isEnabledDownload}
            onClick={async e =>
              await alerts.withApiErrorHandling(async () => {
                let selectedUsers = users.filter(u => u.selected);
                const options = {
                  company_ids: [selectedCompany.id],
                  one_file_by_employee: isOneFileByEmployee
                };
                if (selectedUsers.length > 0)
                  options["user_ids"] = selectedUsers.map(u => u.id);
                if (minDate) options["min_date"] = isoFormatLocalDate(minDate);
                if (maxDate) options["max_date"] = isoFormatLocalDate(maxDate);
                e.preventDefault();
                trackLink({
                  href: `/download_company_activity_report`,
                  linkType: "download"
                });
                await api.jsonHttpQuery(HTTP_QUERIES.excelExport, {
                  json: options
                });
                setIsEnabledDownload(false);
                handleClose();
                await addExport();
              }, "download-company-report")
            }
          >
            Télécharger
          </LoadingButton>
        </>
      }
    />
  );
}
