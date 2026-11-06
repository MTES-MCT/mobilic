import React from "react";
import { makeStyles } from "@mui/styles";
import Drawer from "@mui/material/Drawer";
import { useHistory } from "react-router-dom";
import { useAdminStore, useAdminCompanies } from "../../store/store";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { useApi } from "common/utils/api";
import { useMissionDrawer } from "../../drawers/MissionDrawer";
import NewMissionForm from "../../../common/NewMissionForm";
import CloseButton from "../../../common/CloseButton";
import {
  buildLogLocationPayloadFromAddress,
  CREATE_MISSION_MUTATION,
  LOG_LOCATION_MUTATION
} from "common/utils/apiQueries/missions";

const useStyles = makeStyles((theme) => ({
  missionTitle: {
    margin: 0,
    marginRight: theme.spacing(4),
    fontSize: "2em",
    fontWeight: "bold"
  },
  missionTitleContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing(3)
  }
}));

const NewMissionDrawer = ({ open, onClose }) => {
  const classes = useStyles();
  const adminStore = useAdminStore();
  const [adminCompanies] = useAdminCompanies();
  const alerts = useSnackbarAlerts();
  const api = useApi();
  const history = useHistory();
  const openMission = useMissionDrawer()[1];

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <div className={classes.missionTitleContainer}>
        <h1 className={classes.missionTitle}>
          Mission passée
        </h1>
        <CloseButton onClick={onClose} />
      </div>
      <NewMissionForm
        companies={adminCompanies}
        companyId={adminStore.companyId}
        overrideSettings={adminStore.settings}
        companyAddresses={adminStore.knownAddresses}
        currentPosition={null}
        disableGeolocation={true}
        disableKilometerReading={true}
        withDay={true}
        withEndLocation={true}
        handleSubmit={async (missionInfos) =>
          await alerts.withApiErrorHandling(async () => {
            const missionResponse = await api.graphQlMutate(
              CREATE_MISSION_MUTATION,
              {
                name: missionInfos.mission,
                companyId: missionInfos.company.id,
                vehicleId: missionInfos.vehicle
                  ? missionInfos.vehicle.id
                  : null,
                vehicleRegistrationNumber: missionInfos.vehicle
                  ? missionInfos.vehicle.registrationNumber
                  : null,
                pastRegistrationJustification:
                  missionInfos.pastRegistrationJustification
              }
            );
            const mission = missionResponse.data.activities.createMission;
            const startLocationResponse = api
              .graphQlMutate(
                LOG_LOCATION_MUTATION,
                buildLogLocationPayloadFromAddress(
                  missionInfos.address,
                  mission.id,
                  true
                )
              )
              .then((response) => response.data.activities.logLocation);

            const endLocationResponse = api
              .graphQlMutate(
                LOG_LOCATION_MUTATION,
                buildLogLocationPayloadFromAddress(
                  missionInfos.endAddress,
                  mission.id,
                  false
                )
              )
              .then((response) => response.data.activities.logLocation);

            await Promise.all([startLocationResponse, endLocationResponse]);
            history.push("/admin/activities");
            openMission(mission.id);
            onClose();
          }, "create-mission")
        }
      />
    </Drawer>
  );
};

export default NewMissionDrawer;
