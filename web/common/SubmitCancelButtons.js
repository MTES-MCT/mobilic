import React from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { LoadingButton } from "common/components/LoadingButton";

export function SubmitCancelButtons({ onSubmit, onCancel }) {
  return (
    <Stack direction="row" justifyContent="space-evenly">
      <LoadingButton
        size="small"
        color="primary"
        variant="contained"
        onClick={() => onSubmit()}
      >
        Enregistrer
      </LoadingButton>
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
