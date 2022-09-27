import React from "react";

import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { getTimezone, TIMEZONES } from "common/utils/timezones";

const TimezoneSelect = ({ currentTimezone, setTimezone }) => {
  return (
    <TextField
      required
      select
      fullWidth
      className="vertical-form-text-input"
      style={{ textAlign: "left" }}
      label="Fuseau Horaire"
      value={currentTimezone.name}
      onChange={e => {
        setTimezone(getTimezone(e.target.value));
      }}
    >
      {TIMEZONES.map(({ name, label }) => (
        <MenuItem key={`timezone__${name}`} value={name}>
          {label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default TimezoneSelect;
