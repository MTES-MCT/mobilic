import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle
} from "@dataesr/react-dsfr";
import { Alert } from "@mui/material";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { useApi } from "common/utils/api";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import { addDaysToDate, isoFormatLocalDate } from "common/utils/time";
import React from "react";
import { useSnackbarAlerts } from "../../../common/Snackbar";

const useStyles = makeStyles(theme => ({
  modalFooter: {
    marginLeft: "auto"
  },
  subtitle: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  filterGrid: {
    paddingTop: theme.spacing(2),
    paddingRight: theme.spacing(2),
    flexShrink: 0
  }
}));

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
  const classes = useStyles();

  const [exportFilter, setExportFilter] = React.useState(controlFilters);

  const today = new Date();
  const oneYearAgo = addDaysToDate(new Date(), -365);

  return (
    <Modal isOpen={open} hide={handleClose} size="lg">
      <ModalTitle>Générez des fichiers C1B</ModalTitle>
      <ModalContent>
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
          Les données des contrôles "LIC papier", "Horaire de service" et "pas
          de LIC" peuvent être exportées au format excel.
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
              value={exportFilter.fromDate}
              inputFormat="d MMMM yyyy"
              disableCloseOnSelect={false}
              disableMaskedInput={true}
              onChange={newFromDate => {
                setExportFilter(prevFilters => {
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
              value={exportFilter.toDate}
              inputFormat="d MMMM yyyy"
              disableCloseOnSelect={false}
              disableMaskedInput={true}
              onChange={newToDate => {
                setExportFilter(prevFilters => {
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
        </Grid>
      </ModalContent>
      <ModalFooter>
        <Button
          title="téléchargement"
          className={classes.modalFooter}
          onClick={async () => {
            alerts.withApiErrorHandling(async () => {
              const options = {};
              await api.downloadFileHttpQuery(HTTP_QUERIES.controlExcelExport, {
                json: options
              });
            }, "download-control-c1b");
          }}
        >
          Générer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
