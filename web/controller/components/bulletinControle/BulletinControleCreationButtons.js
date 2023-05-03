import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export function BulletinControleCreationButtons({
  controlData,
  openBulletinControl
}) {
  return (
    <Stack direction="column" spacing={2} mt={2} alignItems="center">
      <Button
        color="primary"
        variant="contained"
        size="small"
        onClick={openBulletinControl}
      >
        Éditer un bulletin de contrôle
      </Button>
    </Stack>
  );
}
