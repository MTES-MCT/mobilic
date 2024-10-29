import React from "react";
import Stack from "@mui/material/Stack";
import { LoadingButton } from "common/components/LoadingButton";
import { Button } from "@codegouvfr/react-dsfr/Button";

export function SubmitCancelButtons({ onSubmit, onCancel }) {
  return (
    <Stack direction="row" justifyContent="space-evenly">
      <LoadingButton size="small" onClick={() => onSubmit()}>
        Enregistrer
      </LoadingButton>
      <Button size="small" priority="secondary" onClick={() => onCancel()}>
        Annuler
      </Button>
    </Stack>
  );
}
