import React from "react";
import Typography from "@mui/material/Typography";
import { useAdminStore } from "../../store/store";
import Grid from "@mui/material/Grid";
import { MissionLocationInfo } from "../MissionLocationInfo";
import { useMissionDetailsStyles } from "./MissionDetailsStyle";

export function MissionDetailsLocations({
  mission,
  missionActions,
  dateTimeFormatter,
  isEditable,
  showKilometerReading,
  titleProps = {}
}) {
  const classes = useMissionDetailsStyles();
  const adminStore = useAdminStore();

  const missionCompany = adminStore.companies.find(
    c => c.id === mission.companyId
  );
  const defaultAddresses = adminStore.knownAddresses.filter(
    a => missionCompany && a.companyId === missionCompany.id
  );

  return (
    <Grid container justifyContent="space-between" spacing={4}>
      <Grid item xs={12} sm={6}>
        <Typography variant="h5" {...titleProps}>
          Début
        </Typography>
        <MissionLocationInfo
          showLocation={!mission.isHoliday}
          location={mission.startLocation}
          time={mission.startTime ? dateTimeFormatter(mission.startTime) : null}
          editLocation={
            isEditable
              ? address =>
                  missionActions.updateLocation(
                    address,
                    true,
                    mission.startLocation?.kilometerReading
                  )
              : null
          }
          editKm={
            isEditable
              ? km => missionActions.updateKilometerReading(km, true)
              : null
          }
          showKm={showKilometerReading}
          defaultAddresses={defaultAddresses}
          maxKmReading={mission.endLocation?.kilometerReading}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Typography variant="h5" {...titleProps}>
          Fin
        </Typography>
        <MissionLocationInfo
          showLocation={!mission.isHoliday}
          location={mission.endLocation}
          time={
            mission.startTime && !(mission.isDeleted && !mission.isComplete) ? (
              <span>
                {dateTimeFormatter(mission.endTimeOrNow)}{" "}
                {mission.isComplete ? (
                  ""
                ) : (
                  <span className={classes.runningMissionText}>(en cours)</span>
                )}
              </span>
            ) : null
          }
          editLocation={
            isEditable
              ? address =>
                  missionActions.updateLocation(
                    address,
                    false,
                    mission.endLocation?.kilometerReading
                  )
              : null
          }
          editKm={
            isEditable
              ? km => missionActions.updateKilometerReading(km, false)
              : null
          }
          showKm={showKilometerReading}
          defaultAddresses={defaultAddresses}
          minKmReading={mission.startLocation?.kilometerReading}
        />
      </Grid>
    </Grid>
  );
}
