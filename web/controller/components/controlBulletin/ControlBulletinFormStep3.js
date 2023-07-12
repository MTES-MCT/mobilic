import React from "react";

import Stack from "@mui/material/Stack";
import { TextInput } from "@dataesr/react-dsfr";
import { Typography } from "@mui/material";
import { InfractionsAvailableSoon } from "../infractions/InfractionsAvailableSoon";
import Alert from "@mui/material/Alert";

export function ControlBulletinFormStep3({
  handleEditControlBulletin,
  controlBulletin,
  grecoId,
  onUpdateGrecoId,
  controlCanBeDownloaded
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <Typography variant="h5">Infractions retenues</Typography>
      <InfractionsAvailableSoon />
      <TextInput
        value={grecoId}
        name="grecoId"
        onChange={e => onUpdateGrecoId(e.target.value)}
        label="Votre identifiant de carte contrôleur"
      />
      <TextInput
        value={controlBulletin.observation || ""}
        name="observation"
        label="Observations"
        rows="3"
        onChange={e => handleEditControlBulletin(e)}
        textarea
      />
      {!controlCanBeDownloaded && (
        <Alert severity="warning">
          Certains champs obligatoires doivent être renseignés pour permettre le
          téléchargement du Bulletin de Contrôle.
        </Alert>
      )}
    </Stack>
  );
}
