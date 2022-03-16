import React from "react";
import Typography from "@mui/material/Typography";
import DialogContent from "@mui/material/DialogContent";
import MobileDatePicker from "@mui/lab/MobileDatePicker";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import { useApi } from "common/utils/api";
import { makeStyles } from "@mui/styles";
import { LoadingButton } from "common/components/LoadingButton";
import { CompanyFilter } from "./CompanyFilter";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { EmployeeFilter } from "./EmployeeFilter";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { DAY, isoFormatLocalDate } from "common/utils/time";
import Alert from "@mui/material/Alert";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { DateOrDateTimeRangeSelectionContext } from "common/components/DateOrDateTimeRangeSelectionContext";

const useStyles = makeStyles(theme => ({
  start: {
    marginRight: theme.spacing(4)
  },
  end: {
    marginLeft: theme.spacing(4)
  },
  flexGrow: {
    flexGrow: 1
  },
  grid: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  switchContainer: {
    display: "flex",
    alignItems: "center"
  },
  subTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export default function C1BExport({
  open,
  handleClose,
  companies = [],
  users = [],
  defaultMinDate = null,
  defaultMaxDate = null
}) {
  const MAX_RANGE_DAYS = 60;
  const today = new Date();

  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const classes = useStyles();

  const [minDate, setMinDate] = React.useState(defaultMinDate);
  const [maxDate, setMaxDate] = React.useState(defaultMaxDate);
  const [sign, setSign] = React.useState(true);
  const [dateRangeError, setDateRangeError] = React.useState(null);
  const [_companies, setCompanies] = React.useState([]);
  const [_users, setUsers] = React.useState([]);

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
    setCompanies(companies);
    setUsers(users);

    if (invalidDateRange(defaultMinDate, defaultMaxDate)) {
      setMinDate(
        new Date(defaultMaxDate.getTime() - MAX_RANGE_DAYS * DAY * 1000)
      );
    } else {
      setMinDate(defaultMinDate);
    }
    setMaxDate(defaultMaxDate);
  }, [open]);

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md">
      <CustomDialogTitle
        title="Générer des fichiers C1B"
        handleClose={handleClose}
      />
      <DialogContent>
        <Typography gutterBottom>
          Mobilic permet d'exporter les données d'activité au format C1B, qui
          est le format utilisé pour les données des{" "}
          <strong>cartes conducteur</strong> de{" "}
          <strong>chronotachygraphe</strong>.
        </Typography>
        <Typography gutterBottom>
          Si vous êtes équipés d'un logiciel d'analyse des données tachyraphe
          vous pouvez donc l'utiliser pour traiter les données Mobilic, une fois
          exportées dans ce format.
        </Typography>
        <Typography variant="h5" className={classes.subTitle}>
          Conditions d'export
        </Typography>
        <Typography gutterBottom>
          Le téléchargement produit un dossier zippé (.zip) qui contient{" "}
          <strong>un fichier C1B pour chaque travailleur</strong> dans le
          périmètre choisi (précisé par les options ci-dessous). Si un
          travailleur n'a pas d'activités dans la période demandée aucun fichier
          C1B ne sera généré pour lui, même si ce travailleur est dans la liste.
        </Typography>
        <Typography variant="h5" className={classes.subTitle}>
          Avertissement
        </Typography>
        <Alert severity="warning">
          <Typography gutterBottom>
            Les fichiers générés par Mobilic respectent la norme C1B, mais ne
            sont pour autant pas tout à fait identiques aux fichiers des cartes
            conducteur (ex. : certaines parties sont laissées vides faute de
            données, les signatures numériques sont différentes, ...).
          </Typography>
          <Typography>
            Si jamais vous ne parvenez à lire les fichiers Mobilic depuis votre
            logiciel d'analyse n'hésitez pas à nous contacter à l'adresse mail{" "}
            <a href="mailto:mobilic@beta.gouv.fr">mobilic@beta.gouv.fr</a>.
          </Typography>
        </Alert>
        <Typography variant="h5" className={classes.subTitle}>
          Paramètres
        </Typography>
        <Typography>
          Les données d'activité sont limitées à une{" "}
          <strong>période qui ne peut pas dépasser 60 jours</strong>. Par défaut
          les fichiers générés contiendront les données d'activité sur la
          période considérée de <strong>tous</strong> les travailleurs de{" "}
          <strong>toutes</strong> vos entreprises. Vous pouvez limiter la liste
          à certaines entreprises et/ou à certains salariés.
        </Typography>
        <Grid spacing={4} container className={classes.grid}>
          {_companies.length > 1 && (
            <Grid item sm={6} className={classes.flexGrow}>
              <CompanyFilter
                companies={_companies}
                setCompanies={setCompanies}
              />
            </Grid>
          )}
          <Grid
            item
            className={classes.flexGrow}
            sm={_companies.length > 1 ? 6 : 12}
          >
            <EmployeeFilter users={_users} setUsers={setUsers} />
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
                showToolbar={false}
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
                showToolbar={false}
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
            <Box className={classes.switchContainer}>
              <Switch
                color="secondary"
                checked={sign}
                onChange={e => setSign(e.target.checked)}
              />
              <Typography style={sign ? {} : { opacity: 0.3 }}>
                Ajouter des signatures numériques aux fichiers pour prouver leur
                intégrité
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <CustomDialogActions>
        <LoadingButton
          color="primary"
          variant="contained"
          disabled={!minDate || !maxDate || dateRangeError}
          onClick={async e => {
            let selectedCompanies = _companies.filter(c => c.selected);
            if (selectedCompanies.length === 0) selectedCompanies = _companies;
            let selectedUsers = _users.filter(u => u.selected);
            const options = {
              company_ids: selectedCompanies.map(c => c.id)
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
      </CustomDialogActions>
    </Dialog>
  );
}
