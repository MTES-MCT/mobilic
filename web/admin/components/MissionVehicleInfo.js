import React from "react";
import { getVehicleName } from "common/utils/vehicles";
import { VehicleField } from "../../common/VehicleField";
import { EditableMissionInfo } from "./EditableMissionInfo";
import makeStyles from "@material-ui/core/styles/makeStyles";

export const useStyles = makeStyles(theme => ({
  placeholder: {
    fontStyle: "italic",
    color: theme.palette.grey[500]
  }
}));

export function MissionVehicleInfo({ vehicle, editVehicle, vehicles }) {
  const classes = useStyles();

  return (
    <EditableMissionInfo
      label="Véhicule utilisé"
      value={vehicle}
      format={v =>
        v ? (
          getVehicleName(v, true)
        ) : (
          <span className={classes.placeholder}>Aucun véhicule utilisé</span>
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
