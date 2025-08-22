import React from "react";
import Grid from "@mui/material/Grid";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function LogHolidayButton({ onClick }) {
  return (
    <Grid
      container
      item
      direction="row"
      alignItems="center"
      justifyContent={{ sm: "flex-end" }}
      sm={6}
    >
      <Button
        priority="tertiary no outline"
        iconId="fr-icon-calendar-2-fill"
        iconPosition="left"
        onClick={onClick}
      >
        Renseigner une indisponibilité
      </Button>
    </Grid>
  );
}
