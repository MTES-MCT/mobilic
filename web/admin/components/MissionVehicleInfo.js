import React from "react";
import { getVehicleName } from "common/utils/vehicles";
import { VehicleField } from "../../common/VehicleField";
import { EditableMissionInfo } from "./EditableMissionInfo";
import { useTypographyStyles } from "../../common/typography/TypographyStyles";

export function MissionVehicleInfo({ vehicle, editVehicle, vehicles }) {
  const typographyClasses = useTypographyStyles();

  return (
    <EditableMissionInfo
      label="Véhicule utilisé"
      value={vehicle}
      format={v =>
        v ? (
          getVehicleName(v, true)
        ) : (
          <span className={typographyClasses.disabled}>
            Aucun véhicule utilisé
          </span>
        )
      }
      renderEditMode={(newVehicle, setNewVehicle) => (
        <VehicleField
          label="Véhicule"
          vehicle={newVehicle}
          setVehicle={setNewVehicle}
          vehicles={vehicles}
          allowCreate={false}
          variant="outlined"
          size="small"
        />
      )}
      onEdit={editVehicle}
      disabledEdit={newVehicle => !newVehicle}
    />
  );
}
