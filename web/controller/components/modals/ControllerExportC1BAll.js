import { Button } from "@dataesr/react-dsfr";
import { Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { useApi } from "common/utils/api";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { addDaysToDate, isoFormatLocalDate } from "common/utils/time";
import React from "react";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import SignFilesCheckbox from "../../../common/SignFiles";
import Modal, { modalStyles } from "../../../common/Modal";

export default function ControllerExportC1BAll({
  open,
  handleClose,
  controlFilters = {
    fromDate: null,
    toDate: null
  }
}) {
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const classes = modalStyles();

  const [exportFilters, setExportFilters] = React.useState(controlFilters);
  const [sign, setSign] = React.useState(true);

  const today = new Date();
  const oneYearAgo = addDaysToDate(new Date(), -365);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Générez des fichiers C1B"
      content={
        <>
          <p>
            Mobilic permet d'exporter les données d'activité au format C1B, qui
            est le format utilisé pour les données des{" "}
            <strong>cartes conducteur</strong> de{" "}
            <strong>chronotachygraphe</strong>.
          </p>
          <Typography variant="h4" className={classes.subtitle}>
            Conditions d’export
          </Typography>
          <p>
            Le téléchargement produit un dossier zippé (.zip) qui contient{" "}
            <strong>un fichier C1B pour chaque travailleur contrôlé</strong>.
          </p>
          <Alert severity="warning">
            Seuls les contrôles de type "Mobilic" seront exportés au format C1B.
          </Alert>
          <Typography variant="h4" className={classes.subtitle}>
            Options
          </Typography>
          <p>
            Les données d'activité sont limitées à une{" "}
            <strong>période qui ne peut pas dépasser 28 jours</strong>.
          </p>
          <Grid
            spacing={2}
            container
            alignItems="end"
            justifyContent="left"
            className={classes.filterGrid}
          >
            <Grid item sm={6}>
              <MobileDatePicker
                label="Début"
                value={exportFilters.fromDate}
                inputFormat="d MMMM yyyy"
                disableCloseOnSelect={false}
                disableMaskedInput={true}
                onChange={newFromDate => {
                  setExportFilters(prevFilters => {
                    return {
                      ...prevFilters,
                      fromDate: isoFormatLocalDate(newFromDate),
                      toDate:
                        newFromDate > new Date(prevFilters.toDate)
                          ? isoFormatLocalDate(newFromDate)
                          : prevFilters.toDate
                    };
                  });
                }}
                minDate={oneYearAgo}
                maxDate={today}
                renderInput={props => (
                  <TextField
                    {...props}
                    required
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item sm={6}>
              <MobileDatePicker
                label="Fin"
                value={exportFilters.toDate}
                inputFormat="d MMMM yyyy"
                disableCloseOnSelect={false}
                disableMaskedInput={true}
                onChange={newToDate => {
                  setExportFilters(prevFilters => {
                    return {
                      ...prevFilters,
                      toDate: isoFormatLocalDate(newToDate),
                      fromDate:
                        newToDate < new Date(prevFilters.fromDate)
                          ? isoFormatLocalDate(newToDate)
                          : prevFilters.fromDate
                    };
                  });
                }}
                maxDate={today}
                renderInput={props => (
                  <TextField
                    {...props}
                    required
                    variant="outlined"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <SignFilesCheckbox sign={sign} setSign={setSign} />
            </Grid>
          </Grid>
        </>
      }
      actions={
        <Button
          title="téléchargement"
          className={classes.modalFooter}
          onClick={async () => {
            alerts.withApiErrorHandling(async () => {
              const options = {
                min_date: exportFilters.fromDate,
                max_date: exportFilters.toDate,
                with_digital_signatures: sign
              };
              await api.downloadFileHttpQuery(HTTP_QUERIES.controlsC1bExport, {
                json: options
              });
            }, "download-control-c1b-all");
          }}
        >
          Générer
        </Button>
      }
    />
  );
}
