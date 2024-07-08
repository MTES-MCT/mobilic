import React from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function SignFilesCheckbox({ sign, setSign }) {
  return (
    <FormControlLabel
      control={
        <Switch
          color="secondary"
          checked={sign}
          onChange={e => setSign(e.target.checked)}
        />
      }
      label="Ajouter des signatures numériques aux fichiers pour prouver leur
    intégrité"
      sx={{ opacity: sign ? 1.0 : 0.8 }}
    />
  );
}
