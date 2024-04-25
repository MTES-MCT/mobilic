import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useAdminStore } from "../../store/store";
import { MissionVehicleInfo } from "../MissionVehicleInfo";
import { useMissionDetailsStyles } from "./MissionDetailsStyle";

export function MissionDetailsVehicle({
  mission,
  missionActions,
  isEditable,
  titleProps
}) {
  const classes = useMissionDetailsStyles();

  const adminStore = useAdminStore();
  const vehicles = React.useMemo(
    () =>
      adminStore.vehicles.filter(
        v => mission?.companyId && v.companyId === mission.companyId
      ),
    [mission, adminStore]
  );
  return (
    <Box className="flex-row" pb={4} style={{ alignItems: "center" }}>
      <Typography variant="h5" {...titleProps} className={classes.vehicle}>
        Véhicule :
      </Typography>
      <MissionVehicleInfo
        vehicle={mission.vehicle}
        editVehicle={isEditable ? missionActions.updateVehicle : null}
        vehicles={vehicles}
      />
    </Box>
  );
}
