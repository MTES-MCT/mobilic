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
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { EmployeeFilter } from "./EmployeeFilter";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import Grid from "@mui/material/Grid";
import { isoFormatLocalDate } from "common/utils/time";
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
  subTitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

export default function ExcelExport({
  open,
  handleClose,
  companies = [],
  users = [],
  defaultMinDate = null,
  defaultMaxDate = null
}) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const { trackLink } = useMatomo();
  const [minDate, setMinDate] = React.useState(defaultMinDate);
  const [maxDate, setMaxDate] = React.useState(defaultMaxDate);

  const [_companies, setCompanies] = React.useState([]);
  const [_users, setUsers] = React.useState([]);

  const today = new Date();

  React.useEffect(() => {
    setCompanies(companies);
    setUsers(users);
    setMinDate(defaultMinDate);
    setMaxDate(defaultMaxDate);
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
              />
            </Grid>
          </DateOrDateTimeRangeSelectionContext>
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
              if (minDate) options["min_date"] = isoFormatLocalDate(minDate);
              if (maxDate) options["max_date"] = isoFormatLocalDate(maxDate);
              e.preventDefault();
              trackLink({
                href: `/download_company_activity_report`,
                linkType: "download"
              });
              await api.downloadFileHttpQuery(HTTP_QUERIES.excelExport, {
                json: options
              });
            }, "download-company-report")
          }
        >
          Télécharger
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
