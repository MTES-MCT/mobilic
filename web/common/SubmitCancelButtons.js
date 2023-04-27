import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

export function SubmitCancelButtons({ onSubmit, onCancel }) {
  return (
    <Stack direction="row" justifyContent="space-evenly">
      <Button
        size="small"
        color="primary"
        variant="contained"
        onClick={() => onSubmit()}
      >
        Enregistrer
      </Button>
      <Button
        size="small"
        color="primary"
        variant="outlined"
        onClick={() => onCancel()}
      >
        Annuler
      </Button>
    </Stack>
  );
}
