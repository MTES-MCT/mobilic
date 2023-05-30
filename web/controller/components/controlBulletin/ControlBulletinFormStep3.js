import React from "react";

import Stack from "@mui/material/Stack";
import { TextInput } from "@dataesr/react-dsfr";

export function ControlBulletinFormStep3({
  handleEditControlBulletin,
  controlBulletin
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
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
