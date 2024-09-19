import { Button } from "@codegouvfr/react-dsfr/Button";
import { Alert } from "@mui/material";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useApi } from "common/utils/api";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import React from "react";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import SignFilesCheckbox from "../../../common/SignFiles";
import { CheckboxField } from "../../../common/CheckboxField";
import Modal, { modalStyles } from "../../../common/Modal";

export default function ControllerExportC1BOne({
  controlId,
  open,
  handleClose
}) {
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const classes = modalStyles();
  const [employeeVersion, setEmployeeVersion] = React.useState(true);

  const [sign, setSign] = React.useState(true);

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="Générer un export C1B"
      content={
        <>
          <Alert severity="warning">
            <Typography>
              Les fichiers générés par Mobilic respectent la norme C1B, mais ne
              sont pour autant pas tout à fait identiques aux fichiers des
              cartes conducteur (par exemple: certaines parties sont laissées
              vides faute de données, les signatures numériques sont différentes
              ...).
            </Typography>
            <Typography mt={1}>
              Si jamais vous ne parvenez pas à lire les fichiers Mobilic depuis
              votre logiciel d'analyse n'hésitez pas à nous contacter à
              l'adresse mail{" "}
              <Link href="mailto:contact@mobilic.beta.gouv.fr">
                contact@mobilic.beta.gouv.fr
              </Link>
              .
            </Typography>
          </Alert>
          <Typography variant="h4" className={classes.subtitle}>
            Options
          </Typography>
          <p>
            Les données d'activité sont limitées à une{" "}
            <strong>période qui ne peut pas dépasser 29 jours</strong>.
          </p>
          <CheckboxField
            mt={2}
            checked={employeeVersion}
            onChange={() => setEmployeeVersion(!employeeVersion)}
            label={`Obtenir deux fichiers pour ce salarié : une version saisie salarié et une version validée par le gestionnaire.`}
          />
          <Grid
            spacing={2}
            container
            alignItems="end"
            justifyContent="left"
            className={classes.filterGrid}
          >
            <Grid item xs={12}>
              <SignFilesCheckbox sign={sign} setSign={setSign} />
            </Grid>
          </Grid>
        </>
      }
      actions={
        <Button
          className={classes.modalFooter}
          onClick={async () => {
            alerts.withApiErrorHandling(async () => {
              const options = {
                control_id: controlId,
                with_digital_signatures: sign,
                employee_version: employeeVersion
              };
              await api.downloadFileHttpQuery(HTTP_QUERIES.controlC1bExport, {
                json: options
              });
            }, "download-control-c1b-one");
          }}
        >
          Générer
        </Button>
      }
    />
  );
}
