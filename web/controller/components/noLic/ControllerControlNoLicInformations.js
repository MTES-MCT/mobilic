import React from "react";
import Stack from "@mui/material/Stack";
import { ControllerControlNoLicInformationsNotes as Notes } from "./ControllerControlNoLicInformationsNotes";
import { ControllerControlNoLicInformationsInfos as Infos } from "./ControllerControlNoLicInformationsInfos";

export function ControllerControlNoLicInformations({ notes, setNotes }) {
  return (
    <Stack
      direction="column"
      spacing={2}
      paddingLeft={2}
      paddingRight={1}
      alignItems="center"
    >
      <Notes notes={notes} setNotes={setNotes} />
      <Infos />
    </Stack>
  );
}
