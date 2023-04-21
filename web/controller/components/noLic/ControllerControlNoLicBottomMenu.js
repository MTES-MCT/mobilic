import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";

export function ControllerControlNoLicBottomMenu({
  reportInfraction,
  updatedInfractions
}) {
  return (
    <Stack direction="column" spacing={2} mt={2} alignItems="center">
      <Button
        color="primary"
        variant="contained"
        size="small"
        onClick={() => {}}
      >
        éditer un bulletin de contrôle
      </Button>
      <Button
        color="primary"
        variant="outlined"
        size="small"
        startIcon={<EditIcon />}
        onClick={reportInfraction}
      >
        {updatedInfractions
          ? "Modifier l'infraction retenue"
          : "Relever l'infraction"}
      </Button>
    </Stack>
  );
}
