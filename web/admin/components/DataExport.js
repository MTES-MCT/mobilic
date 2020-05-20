import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import DialogContent from "@material-ui/core/DialogContent";
import { DatePicker } from "@material-ui/pickers";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import DialogActions from "@material-ui/core/DialogActions";
import Box from "@material-ui/core/Box";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";

export function DataExport({ open, handleClose }) {
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const [minDate, setMinDate] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

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
          de début.
        </Typography>
        <Box my={2} className="flex-row-center">
          <DatePicker
            label="Date de début"
            value={minDate}
            format="d MMMM yyyy"
            onChange={setMinDate}
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
          <Button
            color="primary"
            variant="contained"
            onClick={async e => {
              setLoading(true);
              try {
                const optionalQueryString = minDate
                  ? `?min_date=${minDate.toISOString().slice(0, 10)}`
                  : "";
                e.preventDefault();
                const response = await api.httpQuery(
                  "GET",
                  `/download_company_activity_report/${store.companyId()}${optionalQueryString}`
                );
                const blob = await response.blob();
                const link = document.createElement("a");
                link.href = window.URL.createObjectURL(blob);
                link.download = "rapport_activité.xlsx";
                link.dispatchEvent(new MouseEvent("click"));
                setLoading(false);
              } catch (err) {
                setLoading(false);
                throw err;
              }
            }}
          >
            <span
              style={{ position: "relative", visibility: loading && "hidden" }}
            >
              Télécharger
            </span>
            {loading && (
              <CircularProgress
                style={{ position: "absolute" }}
                color="inherit"
                size="1rem"
              />
            )}
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
}
