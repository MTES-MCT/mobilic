import React from "react";

import Stack from "@mui/material/Stack";
import { TextInput } from "@dataesr/react-dsfr";
import { Typography } from "@mui/material";
import { InfractionsAvailableSoon } from "../infractions/InfractionsAvailableSoon";

export function ControlBulletinFormStep3({
  handleEditControlBulletin,
  controlBulletin,
  grecoId,
  onUpdateGrecoId
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <Typography variant="h5">Infractions retenues</Typography>
      <InfractionsAvailableSoon />
      <TextInput
        value={grecoId}
        name="grecoId"
        onChange={e => onUpdateGrecoId(e.target.value)}
        label="Votre identifiant Greco"
      />
      <TextInput
        value={controlBulletin.observation || ""}
        name="observation"
        label="Observations"
        rows="3"
        onChange={e => handleEditControlBulletin(e)}
        textarea
      />
    </Stack>
  );
}
