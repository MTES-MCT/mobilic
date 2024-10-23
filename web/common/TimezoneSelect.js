import React from "react";
import { getTimezone, TIMEZONES } from "common/utils/timezones";
import Notice from "./Notice";
import { Select } from "./forms/Select";

const TimezoneSelect = ({ currentTimezone, setTimezone }) => {
  const isGuyana = currentTimezone.name === "America/Cayenne";
  return (
    <>
      <Select
        label="Fuseau horaire"
        nativeSelectProps={{
          onChange: e => setTimezone(getTimezone(e.target.value)),
          value: currentTimezone.name
        }}
        required
      >
        {TIMEZONES.map(option => (
          <option key={`timezone__${option.name}`} value={option.name}>
            {option.label}
          </option>
        ))}
      </Select>
      {isGuyana && (
        <Notice
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
