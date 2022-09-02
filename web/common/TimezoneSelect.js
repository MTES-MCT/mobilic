import React from "react";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";

const TIMEZONES = [
  "Europe/Paris",
  "America/Martinique",
  "America/Guadeloupe",
  "Indian/Reunion",
  "America/Guyana"
];

const TimezoneSelect = ({ timezone, setTimezone }) => (
  <TextField
    required
    select
    className="vertical-form-text-input"
    label="Fuseau Horaire"
    value={timezone}
    onChange={e => {
      setTimezone(e.target.value);
    }}
  >
    {TIMEZONES.map(timezone => (
      <MenuItem key={`timezone__${timezone}`} value={timezone}>
        {timezone}
      </MenuItem>
    ))}
  </TextField>
);

export default TimezoneSelect;
