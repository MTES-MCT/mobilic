import React from "react";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { DatePicker } from "@material-ui/pickers";
import Dialog from "@material-ui/core/Dialog";
import Box from "@material-ui/core/Box";
import { useApi } from "common/utils/api";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { LoadingButton } from "common/components/LoadingButton";
import { CompanyFilter } from "./CompanyFilter";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { EmployeeFilter } from "./EmployeeFilter";

const useStyles = makeStyles(theme => ({
  start: {
    marginRight: theme.spacing(4)
  },
  end: {
    marginLeft: theme.spacing(4)
  }
}));

export function DataExport({ open, handleClose, companies = [], users = [] }) {
  const api = useApi();
  const alerts = useSnackbarAlerts();
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
    <Dialog onClose={handleClose} open={open}>
      <CustomDialogTitle
        title="Télécharger le rapport d'activité"
        handleClose={handleClose}
      />
      <DialogContent>
        <Typography gutterBottom>
          Les données sont exportées à la vue "jour".
        </Typography>
        <Typography>
          Par défaut l'export contient l'historique <strong>intégral</strong> de{" "}
          <strong>toutes</strong> vos entreprises. Vous pouvez restreindre la
          période en spécificant une date de début et/ou une date de fin, et
          filtrer suivant les entreprises.
        </Typography>
        <Box my={2} className="flex-row-center">
          <EmployeeFilter users={_users} setUsers={setUsers} />
          {_companies.length > 1 && (
            <CompanyFilter companies={_companies} setCompanies={setCompanies} />
          )}
        </Box>
        <Box my={2} className="flex-row-center">
          <DatePicker
            className={classes.start}
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
          <DatePicker
            className={classes.end}
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
        </Box>
      </DialogContent>
      <CustomDialogActions>
        <LoadingButton
          color="primary"
          variant="contained"
          onClick={async e => {
            let selectedCompanies = _companies.filter(c => c.selected);
            if (selectedCompanies.length === 0) selectedCompanies = _companies;
            let selectedUsers = _users.filter(u => u.selected);
            const queryParams = [
              `company_ids=${selectedCompanies.map(c => c.id).join(",")}`
            ];
            if (selectedUsers.length > 0)
              queryParams.push(
                `user_ids=${selectedUsers.map(u => u.id).join(",")}`
              );
            if (minDate)
              queryParams.push(
                `min_date=${minDate.toISOString().slice(0, 10)}`
              );
            if (maxDate)
              queryParams.push(
                `max_date=${maxDate.toISOString().slice(0, 10)}`
              );
            const optionalQueryString =
              queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
            e.preventDefault();
            try {
              const response = await api.httpQuery(
                "POST",
                `/download_company_activity_report${optionalQueryString}`
              );
              const blob = await response.blob();
              const link = document.createElement("a");
              link.href = window.URL.createObjectURL(blob);
              link.download = "rapport_activité.xlsx";
              link.dispatchEvent(new MouseEvent("click"));
            } catch (err) {
              alerts.error(
                formatApiError(err),
                "download_company_report",
                6000
              );
            }
          }}
        >
          Télécharger
        </LoadingButton>
      </CustomDialogActions>
    </Dialog>
  );
}
