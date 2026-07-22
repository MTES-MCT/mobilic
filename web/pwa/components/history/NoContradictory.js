import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { isConnectionError } from "common/utils/errors";
import { Box } from "@mui/material";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: fr.colors.decisions.background.default.grey.hover,
    color: fr.colors.decisions.background.flat.grey.default
  }
}));

export function NoContradictory({
  contradictoryNotYetAvailable,
  contradictoryComputationError
}) {
  const classes = useStyles();

  return (
    <Box p={2} className={classes.container}>
      <Typography
        sx={{ fontWeight: 400, fontSize: "0.875rem", textAlign: "left" }}
      >
        {contradictoryNotYetAvailable
          ? "Les versions contradictoires ne sont pas visibles car la mission n'a pas encore été validée par toutes les parties (salarié, gestionnaire)."
          : contradictoryComputationError
          ? isConnectionError(contradictoryComputationError)
            ? "Les versions contradictoires ne sont pas disponibles pour le moment car il n'y a pas de connexion Internet."
            : "Les versions contradictoires ne sont pas disponibles pour le moment."
          : "Il n'y a pas eu de modifications de la part du gestionnaire."}
      </Typography>
    </Box>
  );
}
