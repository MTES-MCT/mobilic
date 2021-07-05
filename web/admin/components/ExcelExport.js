import React from "react";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { DatePicker } from "@material-ui/pickers";
import Dialog from "@material-ui/core/Dialog";
import { useApi } from "common/utils/api";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { LoadingButton } from "common/components/LoadingButton";
import { CompanyFilter } from "./CompanyFilter";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { EmployeeFilter } from "./EmployeeFilter";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import Grid from "@material-ui/core/Grid";

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
  subTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export default function ExcelExport({
  open,
  handleClose,
  companies = [],
  users = []
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(null);

  const [_companies, setCompanies] = React.useState([]);
  const [_users, setUsers] = React.useState([]);

  React.useEffect(() => {
    setCompanies(companies);
    setUsers(users);
  }, [open]);

  const classes = useStyles();

  return (
    <Dialog onClose={handleClose} open={open} maxWidth="md">
      <CustomDialogTitle
        title="Télécharger le rapport d'activité"
        handleClose={handleClose}
      />
      <DialogContent>
        <Typography gutterBottom>
          Le rapport d'activité est un fichier Excel (.xlsx) qui contient les
          onglets suivants.
        </Typography>
        <ul>
          <li>
            <Typography>
              <strong>Activité</strong>, qui contient la liste des journées de
              travail avec toutes leurs informations : nom de la mission,
              véhicule utilisé, horaires et durées cumulées des activités de la
              journée, frais, ... . Cet onglet est presque identique à la vue{" "}
              <strong>Jour</strong> du tableau ci-derrière.
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Détails</strong>, qui contient l'historique des
              enregistrements et des modifications d'activité.
            </Typography>
          </li>
        </ul>
        <Typography variant="h5" className={classes.subTitle}>
          Options
        </Typography>
        <Typography>
          Par défaut le rapport contient l'historique <strong>intégral</strong>{" "}
          de <strong>tous</strong> les travailleurs de <strong>toutes</strong>{" "}
          vos entreprises. Vous pouvez restreindre la période en spécifiant une
          date de début et/ou une date de fin. Vous pouvez également limiter
          l'historique à certaines entreprises et/ou certains salariés.
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
          <Grid item sm={6}>
            <DatePicker
              label="Date de début"
              value={minDate}
              format="d MMMM yyyy"
              maxDate={maxDate || undefined}
              onChange={setMinDate}
              clearable
              cancelLabel={null}
              clearLabel="Annuler"
              autoOk
              disableFuture
              inputVariant="outlined"
              animateYearScrolling
            />
          </Grid>
          <Grid item sm={6}>
            <DatePicker
              label="Date de fin"
              value={maxDate}
              format="d MMMM yyyy"
              minDate={minDate || undefined}
              onChange={setMaxDate}
              clearable
              cancelLabel={null}
              clearLabel="Annuler"
              autoOk
              disableFuture
              inputVariant="outlined"
              animateYearScrolling
            />
          </Grid>
        </Grid>
      </DialogContent>
      <CustomDialogActions>
        <LoadingButton
          color="primary"
          variant="contained"
          onClick={async e =>
            await alerts.withApiErrorHandling(async () => {
              let selectedCompanies = _companies.filter(c => c.selected);
              if (selectedCompanies.length === 0)
                selectedCompanies = _companies;
              let selectedUsers = _users.filter(u => u.selected);
              const options = {
                company_ids: selectedCompanies.map(c => c.id)
              };
              if (selectedUsers.length > 0)
                options["user_ids"] = selectedUsers.map(u => u.id);
              if (minDate)
                options["min_date"] = minDate.toISOString().slice(0, 10);
              if (maxDate)
                options["max_date"] = maxDate.toISOString().slice(0, 10);
              e.preventDefault();
              trackLink({
                href: `/download_company_activity_report`,
                linkType: "download"
              });
              await api.downloadFileHttpQuery(
                "POST",
                `/companies/download_activity_report`,
                { json: options }
              );
            }, "download-company-report")
          }
        >
          Télécharger
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
