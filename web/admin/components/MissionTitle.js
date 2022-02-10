import { prettyFormatDay } from "common/utils/time";
import { EditableMissionInfo } from "./EditableMissionInfo";
import React from "react";
import TextField from "@material-ui/core/TextField";

export function MissionTitle({ name, startTime, onEdit }) {
  return (
    <EditableMissionInfo
      value={name}
      format={() =>
        `Mission ${name}` ||
        (startTime
          ? `Mission du ${prettyFormatDay(startTime, false)}`
          : "Détails de la mission")
      }
      onEdit={onEdit}
      disabledEdit={newName => !newName}
      typographyProps={{ variant: "h1" }}
      renderEditMode={(newName, setNewName) => (
        <TextField
          variant="outlined"
          label="Nom de la mission"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
      )}
    />
  );
}
