import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import React from "react";
import { CONTROL_TYPES } from "../../utils/useReadControlData";

const controlsTypes = [
  {
    label: "Tous les types",
    value: ""
  },
  ...Object.values(CONTROL_TYPES)
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
