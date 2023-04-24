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

export function ControllerControlNoLicBottomMenu({
  reportInfraction,
  updatedInfractions,
  editBC,
  downloadBC,
  touchedBC
}) {
  const classes = useStyles();
  return (
    <Stack direction="column" spacing={2} mt={2} alignItems="center">
      {touchedBC ? (
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={downloadBC}
          startIcon={<DownloadIcon />}
        >
          télécharger le bulletin de contrôle
        </Button>
      ) : (
        <Button
          color="primary"
          variant="contained"
          size="small"
          onClick={editBC}
        >
          éditer un bulletin de contrôle
        </Button>
      )}
      <Button
        color="primary"
        variant="outlined"
        size="small"
        startIcon={<EditIcon />}
        onClick={reportInfraction}
      >
        {updatedInfractions
          ? "Modifier l'infraction retenue"
          : "Relever l'infraction"}
      </Button>
      {touchedBC && (
        <Button variant="text" className={classes.textButton} onClick={editBC}>
          Modifier le bulletin de contrôle
        </Button>
      )}
    </Stack>
  );
}
