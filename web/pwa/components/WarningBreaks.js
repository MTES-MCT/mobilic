import React from "react";
import { Typography } from "@mui/material";
import { ExternalLink } from "../../common/ExternalLink";
import { Notice } from "../../common/Notice";

export const WarningBreaks = () => (
  <Notice>
    <Typography marginBottom={1}>
      Pour être en règle,{" "}
      <b>pensez à respecter le temps de pause obligatoire</b> lors de votre
      prochaine mission&nbsp;!
    </Typography>
    <Typography fontWeight="bold">
      <ExternalLink
        url="https://mobilic.beta.gouv.fr/resources/regulations"
        text="En savoir plus sur les temps de pause minimum."
        withIcon
      />
    </Typography>
  </Notice>
);
