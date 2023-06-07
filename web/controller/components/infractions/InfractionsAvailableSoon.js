import React from "react";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

export function InfractionsAvailableSoon() {
  return (
    <Alert severity="info" sx={{ height: "fit-content" }}>
      <Typography>
        Vous pourrez bientôt retenir des infractions pour les contrôles. En
        attendant vous pouvez retrouver{" "}
        <a
          href="https://mobilic.beta.gouv.fr/resources/regulations"
          target="_blank"
          rel="noreferrer"
        >
          <u>les différents NATINF ici</u>
        </a>
        .
      </Typography>
    </Alert>
  );
}
