import React from "react";
import Grid from "@mui/material/Grid";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function LogHolidayButton({ onClick, priority, size = "medium", style }) {
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
        priority={priority || "tertiary no outline"}
        size={size}
        iconId={priority ? undefined : "fr-icon-calendar-2-fill"}
        iconPosition={priority ? undefined : "left"}
        style={style}
        onClick={onClick}
      >
        Renseigner une indisponibilité
      </Button>
    </Grid>
  );
}
