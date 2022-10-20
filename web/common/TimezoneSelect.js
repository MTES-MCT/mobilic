import React from "react";
import { Alert, TextField, MenuItem } from "@mui/material";
import { getTimezone, TIMEZONES } from "common/utils/timezones";

const TimezoneSelect = ({ currentTimezone, setTimezone }) => {
  const isGuyana = currentTimezone.name === "America/Cayenne";
  return (
    <>
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
      {isGuyana && (
        <Alert severity="info" style={{ textAlign: "left" }}>
          Attention, les réseaux téléphoniques de Guyane étant basés sur ceux
          des Antilles, il est nécessaire de faire une petite manipulation pour
          utiliser Mobilic correctement : sélectionnez le fuseau horaire de
          Guyane dans votre téléphone puis ajustez manuellement l'heure de votre
          téléphone à l'heure locale.
        </Alert>
      )}
    </>
  );
};

export default TimezoneSelect;
