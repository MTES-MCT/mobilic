import React from "react";
import { CircularProgress, Stack } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useExportsContext } from "../utils/contextExports";

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: fr.colors.decisions.background.default.grey.hover,
    color: fr.colors.decisions.background.flat.grey.default
  }
}));

export const ExportsBanner = () => {
  const classes = useStyles();
  const { cancelExports, nbExports } = useExportsContext();

  if (!nbExports) {
    return;
  }
  return (
    <Stack
      direction="row"
      className={classes.container}
      px={4}
      py={1}
      alignItems="center"
      justifyContent="space-between"
    >
      <Stack direction="row" columnGap={1} alignItems="center">
        <CircularProgress color="inherit" size="1rem" />
        <div>{`${nbExports} export${nbExports > 1 ? 's' : ''} d'activité en cours de préparation... Vous pouvez quitter la page pendant la préparation de${nbExports > 1 ? 's' : ''} l'export${nbExports > 1 ? 's' : ''}.`}</div>
      </Stack>
      <Button
        priority="tertiary no outline"
        iconPosition="right"
        iconId="fr-icon-close-line"
        size="small"
        onClick={cancelExports}
      >
        Annuler
      </Button>
    </Stack>
  );
};
