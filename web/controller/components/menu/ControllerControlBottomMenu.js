import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  textButton: {
    textTransform: "none",
    textDecoration: "underline",
    fontSize: "1rem"
  }
}));

export function ControllerControlBottomMenu({
  reportInfraction,
  updatedInfractions,
  editBDC,
  downloadBDC,
  canDownloadBDC,
  touchedBDC
}) {
  const classes = useStyles();
  return (
    <Stack direction="column" spacing={2} mt={2} alignItems="center">
      {touchedBDC ? (
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={downloadBDC}
          startIcon={<DownloadIcon />}
          disabled={!canDownloadBDC}
        >
          télécharger le bulletin de contrôle
        </Button>
      ) : (
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={editBDC}
        >
          éditer un bulletin de contrôle
        </Button>
      )}
      {reportInfraction && (
        <Button
          color="primary"
          variant="outlined"
          size="small"
          startIcon={<EditIcon />}
          onClick={reportInfraction}
          disabled
        >
          {updatedInfractions
            ? "Modifier l'infraction retenue"
            : "Relever l'infraction"}
        </Button>
      )}
      {touchedBDC && (
        <Button variant="text" className={classes.textButton} onClick={editBDC}>
          Modifier le bulletin de contrôle
        </Button>
      )}
    </Stack>
  );
}
