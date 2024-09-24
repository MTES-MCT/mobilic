import React from "react";
import { TextField, MenuItem } from "@mui/material";
import { getTimezone, TIMEZONES } from "common/utils/timezones";
import Notice from "./Notice";

const TimezoneSelect = ({ currentTimezone, setTimezone }) => {
  const isGuyana = currentTimezone.name === "America/Cayenne";
  return (
    <>
      <TextField
        required
        select
        fullWidth
        className="timezone-select"
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
        <Notice
          style={{ textAlign: "left" }}
          description="Les réseaux téléphoniques de Guyane étant basés sur ceux des Antilles,
          il est nécessaire de faire une petite manipulation pour utiliser
          Mobilic correctement : sélectionnez le fuseau horaire de Guyane dans
          votre téléphone puis ajustez manuellement l'heure de votre téléphone à
          l'heure locale."
        />
      )}
    </>
  );
};

export default TimezoneSelect;
