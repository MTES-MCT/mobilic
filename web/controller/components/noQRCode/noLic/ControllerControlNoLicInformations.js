import React from "react";
import Stack from "@mui/material/Stack";
import { ControllerControlNote as Notes } from "../../details/ControllerControlNote";
import { ControllerControlNoLicInformationsEmployee as InformationsEmployee } from "./ControllerControlNoLicInformationsEmployee";

export function ControllerControlNoLicInformations({ controlData }) {
  return (
    <Stack
      direction="column"
      spacing={2}
      paddingLeft={2}
      paddingRight={1}
      alignItems="center"
    >
      <Notes controlData={controlData} />
      <InformationsEmployee controlData={controlData} />
    </Stack>
  );
}
