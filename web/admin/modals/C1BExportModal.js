import React from "react";
import Typography from "@mui/material/Typography";
import { MobileDatePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { useApi } from "common/utils/api";
import { LoadingButton } from "common/components/LoadingButton";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import Grid from "@mui/material/Grid";
import { DAY, isoFormatLocalDate } from "common/utils/time";
import Alert from "@mui/material/Alert";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { DateOrDateTimeRangeSelectionContext } from "common/components/DateOrDateTimeRangeSelectionContext";
import SignFilesCheckbox from "../../common/SignFiles";
import {
  getUsersToSelectFromTeamSelection,
  unselectAndGetAllTeams
} from "../store/reducers/team";
import { CheckboxField } from "../../common/CheckboxField";
import { TeamFilter } from "../components/TeamFilter";
import { EmployeeFilter } from "../components/EmployeeFilter";
import { CompanyFilter } from "../components/CompanyFilter";
import Modal, { modalStyles } from "../../common/Modal";

export default function C1BExportModal({
  open,
  handleClose,
  companies = [],
  initialUsers = [],
  initialTeams = [],
  defaultMinDate = null,
  defaultMaxDate = null,
  defaultCompany,
  getUsersSinceDate
}) {
  const MAX_RANGE_DAYS = 60;
  const today = new Date();

  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const classes = modalStyles();

  const [minDate, setMinDate] = React.useState(defaultMinDate);
  const [maxDate, setMaxDate] = React.useState(defaultMaxDate);
  const [sign, setSign] = React.useState(true);
  const [dateRangeError, setDateRangeError] = React.useState(null);
  const [_companies, setCompanies] = React.useState([]);
  const [users, setUsers] = React.useState(initialUsers);
  const [teams, setTeams] = React.useState(initialTeams);
  const [employeeVersion, setEmployeeVersion] = React.useState(true);

  React.useEffect(async () => {
    if (minDate < defaultMinDate) {
      const newUsers = await getUsersSinceDate(minDate);
      setUsers(currentUsers => [
        ...currentUsers,
        ...newUsers.filter(
          newUser =>
            !currentUsers
              .map(currentUser => currentUser.id)
              .includes(newUser.id)
        )
      ]);
    }
  }, [minDate]);

  const invalidDateRange = (minDate, maxDate) =>
    maxDate &&
    minDate &&
    maxDate.getTime() - minDate.getTime() > MAX_RANGE_DAYS * DAY * 1000;

  React.useEffect(() => {
    if (invalidDateRange(minDate, maxDate)) {
      setDateRangeError(
        `La période sélectionnée doit être inférieure à ${MAX_RANGE_DAYS} jours !`
      );
    } else setDateRangeError(null);
  }, [minDate, maxDate]);

  React.useEffect(() => {
    setCompanies(
      companies.map(c => {
        return { ...c, selected: c.id === defaultCompany.id };
      })
    );

    if (invalidDateRange(defaultMinDate, defaultMaxDate)) {
      setMinDate(
        new Date(defaultMaxDate.getTime() - MAX_RANGE_DAYS * DAY * 1000)
      );
    } else {
      setMinDate(defaultMinDate);
    }
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

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Générer des fichiers C1B"
      content={
        <>
          <Typography gutterBottom>
            Mobilic permet d'exporter les données d'activité au format C1B, qui
            est le format utilisé pour les données des{" "}
            <strong>cartes conducteur</strong> de{" "}
            <strong>chronotachygraphe</strong>.
          </Typography>
          <Typography gutterBottom>
            Si vous êtes équipés d'un logiciel d'analyse des données tachyraphe
            vous pouvez donc l'utiliser pour traiter les données Mobilic, une
            fois exportées dans ce format.
          </Typography>
          <Typography variant="h5" className={classes.subtitle}>
            Conditions d'export
          </Typography>
          <Typography gutterBottom>
            Le téléchargement produit un dossier zippé (.zip) qui contient{" "}
            <strong>un fichier C1B pour chaque travailleur</strong> dans le
            périmètre choisi (précisé par les options ci-dessous).
            <Alert severity="warning" className={classes.grid}>
              <Typography component="div" variant="body1" gutterBottom>
                Si un travailleur n'a pas effectué d'activités dans la période
                demandée, aucun fichier C1B ne sera généré le concernant, même
                s'il est dans la liste d'export.
              </Typography>
            </Alert>
          </Typography>
          <Typography variant="h5" className={classes.subtitle}>
            Avertissement
          </Typography>
          <Alert severity="warning">
            <Typography component="div" variant="body1" gutterBottom>
              <ul>
                <li>
                  Les fichiers générés par Mobilic respectent la norme C1B, mais
                  ne sont pour autant pas tout à fait identiques aux fichiers
                  des cartes conducteur (ex. : certaines parties sont laissées
                  vides faute de données, les signatures numériques sont
                  différentes ...). <br />
                  Si jamais vous ne parvenez à lire les fichiers Mobilic depuis
                  votre logiciel d'analyse n'hésitez pas à nous contacter à
                  l'adresse mail{" "}
                  <a href="mailto:assistance@mobilic.beta.gouv.fr">
                    assistance@mobilic.beta.gouv.fr
                  </a>
                  .
                </li>
                <li>
                  En cas d'export pour l'inspection du travail, veillez à ne pas
                  modifier la mise en page du fichier afin qu'il soit considéré
                  comme inchangé par le logiciel de contrôle.
                </li>
              </ul>
            </Typography>
          </Alert>
          <Typography variant="h5" className={classes.subtitle}>
            Options
          </Typography>
          <Typography>
            Les données d'activité sont limitées à une{" "}
            <strong>période qui ne peut pas dépasser 60 jours</strong>.
          </Typography>
          <CheckboxField
            mt={2}
            checked={employeeVersion}
            onChange={() => setEmployeeVersion(!employeeVersion)}
            label={`Obtenir deux fichiers pour chaque salarié : une version saisie salarié et une version validée par le gestionnaire.`}
          />
          <Grid spacing={4} container className={classes.subtitle}>
            {_companies.length > 1 && (
              <Grid item sm={6} sx={{ flexGrow: 1 }}>
                <CompanyFilter
                  companies={_companies}
                  setCompanies={setCompanies}
                />
              </Grid>
            )}
            {teams?.length > 0 && (
              <Grid
                item
                className={classes.flexGrow}
                sm={_companies.length > 1 ? 6 : 12}
              >
                <TeamFilter teams={teams} setTeams={handleTeamFilterChange} />
              </Grid>
            )}
            <Grid
              item
              className={classes.flexGrow}
              sm={_companies.length > 1 ? 6 : 12}
            >
              <EmployeeFilter users={users} setUsers={handleUserFilterChange} />
            </Grid>
            <DateOrDateTimeRangeSelectionContext
              start={minDate}
              setStart={setMinDate}
              end={maxDate}
              setEnd={setMaxDate}
              nullableBounds={false}
            >
              <Grid item sm={6}>
                <MobileDatePicker
                  label="Date de début"
                  value={minDate}
                  inputFormat="d MMMM yyyy"
                  onChange={setMinDate}
                  cancelText={null}
                  disableCloseOnSelect={false}
                  disableMaskedInput={true}
                  maxDate={today}
                  renderInput={props => (
                    <TextField
                      {...props}
                      required
                      variant="outlined"
                      error={!!dateRangeError}
                      helperText={dateRangeError}
                    />
                  )}
                />
              </Grid>
              <Grid item sm={6}>
                <MobileDatePicker
                  label="Date de fin"
                  value={maxDate}
                  inputFormat="d MMMM yyyy"
                  onChange={setMaxDate}
                  cancelText={null}
                  disableCloseOnSelect={false}
                  disableMaskedInput={true}
                  maxDate={today}
                  renderInput={props => (
                    <TextField
                      {...props}
                      required
                      variant="outlined"
                      error={!!dateRangeError}
                      helperText={dateRangeError}
                    />
                  )}
                />
              </Grid>
            </DateOrDateTimeRangeSelectionContext>
            <Grid item xs={12}>
              <SignFilesCheckbox sign={sign} setSign={setSign} />
            </Grid>
          </Grid>
        </>
      }
      actions={
        <LoadingButton
          color="primary"
          variant="contained"
          disabled={!minDate || !maxDate || dateRangeError}
          onClick={async e => {
            let selectedCompanies = _companies.filter(c => c.selected);
            if (selectedCompanies.length === 0) selectedCompanies = _companies;
            let selectedUsers = users.filter(u => u.selected);
            const options = {
              company_ids: selectedCompanies.map(c => c.id),
              employee_version: employeeVersion
            };
            if (selectedUsers.length > 0)
              options["user_ids"] = selectedUsers.map(u => u.id);
            if (minDate) options["min_date"] = isoFormatLocalDate(minDate);
            if (maxDate) options["max_date"] = isoFormatLocalDate(maxDate);
            options["with_digital_signatures"] = sign;
            e.preventDefault();
            trackLink({
              href: `/generate_tachograph_files`,
              linkType: "download"
            });
            try {
              await api.downloadFileHttpQuery(HTTP_QUERIES.companyC1bExport, {
                json: options
              });
            } catch (err) {
              alerts.error(
                formatApiError(err),
                "generate_tachograph_files",
                6000
              );
            }
          }}
        >
          Générer
        </LoadingButton>
      }
    />
  );
}
