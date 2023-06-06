import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import React from "react";

const controlsTypes = [
  {
    label: "Tous les types",
    value: ""
  },
  {
    label: "Mobilic",
    value: "mobilic"
  },
  {
    label: "Pas de LIC",
    value: "sans_lic"
  }
];

export function ControlTypeFilters({ controlsType, setControlsType }) {
  return (
    <TextField
      label="Type de contrôle"
      variant="filled"
      select
      fullWidth
      value={controlsType}
      size="small"
      onChange={e => setControlsType(e.target.value)}
      sx={{ textAlign: "left" }}
    >
      {controlsTypes.map(controlsType => (
        <MenuItem key={controlsType.value} value={controlsType.value}>
          {controlsType.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
