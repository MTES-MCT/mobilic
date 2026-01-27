import { prettyFormatDay } from "common/utils/time";
import { EditableMissionInfo } from "./EditableMissionInfo";
import React from "react";
import TextField from "@mui/material/TextField";
import { fr } from "@codegouvfr/react-dsfr";

export function MissionTitle({
  name,
  startTime,
  onEdit,
  missionPrefix = true,
  ...otherProps
}) {
  return (
    <EditableMissionInfo
      value={name}
      format={() => {
        if (name) {
          return (
            <>
              {missionPrefix && (
                <span style={{ fontWeight: 400 }}>Mission </span>
              )}
              <span style={{ fontWeight: "bold" }}>{name}</span>
            </>
          );
        }
        return (
          <span>
            {startTime
              ? `Mission du ${prettyFormatDay(startTime, false)}`
              : "Détails de la mission"}
          </span>
        );
      }}
      onEdit={onEdit}
      disabledEdit={(newName) => !newName}
      typographyProps={{
        variant: "h3",
        component: "h1",
        fontSize: "1.375rem",
        color: fr.colors.decisions.background.flat.blueFrance.default
      }}
      renderEditMode={(newName, setNewName) => (
        <TextField
          label="Nom de la mission"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
      )}
      justifyContent="center"
      {...otherProps}
    />
  );
}
