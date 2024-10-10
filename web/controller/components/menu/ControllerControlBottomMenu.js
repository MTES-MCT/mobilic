import React from "react";
import Stack from "@mui/material/Stack";
import { makeStyles } from "@mui/styles";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  textButton: {
    textDecoration: "underline"
  }
}));

export function ControllerControlBottomMenu({
  reportInfractions,
  updatedInfractions,
  disabledReportInfractions,
  editBDC,
  downloadBDC,
  canDownloadBDC,
  bdcAlreadyExisting,
  totalAlertsNumber
}) {
  const classes = useStyles();
  return (
    <Stack direction="column" spacing={2} mt={2} alignItems="center">
      {bdcAlreadyExisting ? (
        <Button
          onClick={downloadBDC}
          iconId="fr-icon-download-line"
          iconPosition="left"
          disabled={!canDownloadBDC}
        >
          Télécharger le bulletin de contrôle
        </Button>
      ) : (
        <Button priority="secondary" onClick={editBDC}>
          Éditer un bulletin de contrôle
        </Button>
      )}
      {reportInfractions && (
        <Button
          priority="secondary"
          iconId="fr-icon-edit-line"
          iconPosition="left"
          onClick={reportInfractions}
          disabled={disabledReportInfractions}
        >
          {updatedInfractions
            ? totalAlertsNumber === 1
              ? "Modifier l'infraction retenue"
              : "Modifier les infractions retenues"
            : totalAlertsNumber === 1
            ? "Modifier l'infraction relevée"
            : "Modifier les infractions relevées"}
        </Button>
      )}
      {bdcAlreadyExisting && (
        <Button
          priority="tertiary no outline"
          className={classes.textButton}
          onClick={editBDC}
        >
          Modifier le bulletin de contrôle
        </Button>
      )}
    </Stack>
  );
}
