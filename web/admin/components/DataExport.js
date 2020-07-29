import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { DatePicker } from "@material-ui/pickers";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import Box from "@material-ui/core/Box";
import { useApi } from "common/utils/api";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { LoadingButton } from "common/components/LoadingButton";
import { useAdminStore } from "../utils/store";

const useStyles = makeStyles(theme => ({
  start: {
    marginRight: theme.spacing(4)
  },
  end: {
    marginLeft: theme.spacing(4)
  }
}));

export function DataExport({ open, handleClose }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const [minDate, setMinDate] = React.useState(null);
  const [maxDate, setMaxDate] = React.useState(null);

  const classes = useStyles();

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle disableTypography>
        <Typography variant="h4">Télécharger le rapport d'activité</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Les données sont exportées à la vue "jour".
        </Typography>
        <Typography>
          Par défaut l'export contient l'historique intégral de votre
          entreprise. Vous pouvez restreindre la période en spécificant une date
          de début et/ou une date de fin.
        </Typography>
        <Box my={2} className="flex-row-center">
          <DatePicker
            className={classes.start}
            label="Date de début"
            value={minDate}
            format="d MMMM yyyy"
            maxDate={maxDate}
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
            minDate={minDate}
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
        <DialogActions>
          <LoadingButton
            color="primary"
            variant="contained"
            onClick={async e => {
              const queryParams = [];
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
              const response = await api.httpQuery(
                "GET",
                `/download_company_activity_report/${adminStore.companyId}${optionalQueryString}`
              );
              const blob = await response.blob();
              const link = document.createElement("a");
              link.href = window.URL.createObjectURL(blob);
              link.download = "rapport_activité.xlsx";
              link.dispatchEvent(new MouseEvent("click"));
            }}
          >
            Télécharger
          </LoadingButton>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
