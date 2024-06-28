import React from "react";
import { Box, Typography } from "@mui/material";
import { ExternalLink } from "../../common/ExternalLink";

export const WarningBreaks = () => (
  <Box
    className="fr-notice fr-notice--info"
    textAlign={{ xs: "left", md: "center" }}
    marginY={1}
  >
    <Box className="fr-container">
      <Box className="fr-notice__body">
        <Typography marginBottom={1}>
          Pour être en règle,{" "}
          <b>pensez à respecter le temps de pause obligatoire</b> lors de votre
          prochaine mission !
        </Typography>
        <Typography fontWeight="bold">
          <ExternalLink
            url="https://mobilic.beta.gouv.fr/resources/regulations"
            text="En savoir plus sur les temps de pause minimum."
            withIcon
          />
        </Typography>
      </Box>
    </Box>
  </Box>
);
