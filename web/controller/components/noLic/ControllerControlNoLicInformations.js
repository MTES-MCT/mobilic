import React from "react";
import Stack from "@mui/material/Stack";
import { ControllerControlNoLicInformationsNotes as Notes } from "./ControllerControlNoLicInformationsNotes";
import { ControllerControlNoLicInformationsEmployee as InformationsEmployee } from "./ControllerControlNoLicInformationsEmployee";

export function ControllerControlNoLicInformations({
  notes,
  setNotes,
  controlData
}) {
  return (
    <Stack
      direction="column"
      spacing={2}
      paddingLeft={2}
      paddingRight={1}
      alignItems="center"
    >
      <Notes notes={notes} setNotes={setNotes} />
      <InformationsEmployee controlData={controlData} />
    </Stack>
  );
}
