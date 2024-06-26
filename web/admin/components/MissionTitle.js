import { prettyFormatDay } from "common/utils/time";
import { EditableMissionInfo } from "./EditableMissionInfo";
import React from "react";
import TextField from "@mui/material/TextField";

export function MissionTitle({
  name,
  startTime,
  onEdit,
  missionPrefix = true
}) {
  return (
    <EditableMissionInfo
      value={name}
      format={() =>
        `${missionPrefix ? "Mission " : ""}${name}` ||
        (startTime
          ? `Mission du ${prettyFormatDay(startTime, false)}`
          : "Détails de la mission")
      }
      onEdit={onEdit}
      disabledEdit={newName => !newName}
      typographyProps={{ variant: "h3", component: "h1" }}
      renderEditMode={(newName, setNewName) => (
        <TextField
          label="Nom de la mission"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
      )}
    />
  );
}
