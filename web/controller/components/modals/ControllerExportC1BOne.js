import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle
} from "@dataesr/react-dsfr";
import { Alert } from "@mui/material";
import Link from "@mui/material/Link";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { HTTP_QUERIES } from "common/utils/apiQueries";
import React from "react";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import SignFilesCheckbox from "../../../common/SignFiles";
import { CheckboxField } from "../../../common/CheckboxField";

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

export default function ControllerExportC1BOne({
  controlId,
  open,
  handleClose
}) {
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const classes = useStyles();
  const [employeeVersion, setEmployeeVersion] = React.useState(true);

  const [sign, setSign] = React.useState(true);

  return (
    <Modal isOpen={open} hide={handleClose} size="lg">
      <ModalTitle>Générer un export C1B</ModalTitle>
      <ModalContent>
        <Alert severity="warning">
          <Typography>
            Les fichiers générés par Mobilic respectent la norme C1B, mais ne
            sont pour autant pas tout à fait identiques aux fichiers des cartes
            conducteur (par exemple: certaines parties sont laissées vides faute
            de données, les signatures numériques sont différentes, ...).
          </Typography>
          <Typography mt={1}>
            Si jamais vous ne parvenez pas à lire les fichiers Mobilic depuis
            votre logiciel d'analyse n'hésitez pas à nous contacter à l'adresse
            mail{" "}
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
          label={`Une version saisie salarié et une version validée par le gestionnaire.`}
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
      </ModalContent>
      <ModalFooter>
        <Button
          title="téléchargement"
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
      </ModalFooter>
    </Modal>
  );
}
