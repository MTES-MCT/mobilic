import React from "react";
import Container from "@material-ui/core/Container";
import { PlaceHolder } from "../../common/PlaceHolder";
import Typography from "@material-ui/core/Typography";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import { ACTIVITIES } from "common/utils/activities";
import Box from "@material-ui/core/Box";
import { AccountButton } from "../components/AccountButton";
import { MainCtaButton } from "../components/MainCtaButton";
import Button from "@material-ui/core/Button";

export function BeforeWork({ beginNewMission, activityEventsByDay }) {
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();

  const onEnterNewMissionFunnel = () => {
    modals.open("newMission", {
      handleContinue: missionInfos =>
        modals.open("teamOrSoloChoice", {
          handleContinue: isTeamMode => {
            const handleFirstActivitySelection = updatedCoworkers => {
              modals.open("firstActivity", {
                handleItemClick: activityType =>
                  onCompleteNewMissionFunnel(
                    activityType,
                    missionInfos,
                    updatedCoworkers
                  )
              });
            };
            if (isTeamMode) {
              modals.open("teamSelection", {
                useCurrentEnrollment: false,
                handleContinue: handleFirstActivitySelection
              });
            } else handleFirstActivitySelection(null);
          }
        })
    });
  };

  const onCompleteNewMissionFunnel = (
    activityType,
    missionInfos,
    updatedCoworkers = null
  ) => {
    let teamMates = null;
    if (updatedCoworkers) {
      teamMates = updatedCoworkers
        .filter(cw => !!cw.enroll)
        .map(cw => ({
          id: cw.id,
          firstName: cw.firstName,
          lastName: cw.lastName
        }));
    }
    const createActivity = async (driver = null) => {
      beginNewMission({
        firstActivityType: activityType,
        driver,
        name: missionInfos.mission,
        vehicleId: missionInfos.vehicle ? missionInfos.vehicle.id : null,
        vehicleRegistrationNumber: missionInfos.vehicle
          ? missionInfos.vehicle.registrationNumber
          : null,
        team: teamMates
      });
      modals.close("newMission");
      modals.close("teamOrSoloChoice");
      modals.close("teamSelection");
    };
    if (
      teamMates &&
      teamMates.length > 0 &&
      activityType === ACTIVITIES.drive.name
    ) {
      modals.open("driverSelection", {
        team: [store.userInfo(), ...teamMates],
        handleDriverSelection: createActivity
      });
    } else createActivity();
  };

  return [
    <Container
      key={1}
      className="container scrollable"
      maxWidth={false}
      style={{ justifyContent: "flex-start", flexGrow: 1 }}
    >
      <Box py={2} style={{ alignSelf: "flex-start" }}>
        <AccountButton />
      </Box>
      <PlaceHolder>
        <Typography variant="h3">👋</Typography>
        <Typography variant="h3">Bienvenue sur MobiLIC !</Typography>
      </PlaceHolder>
    </Container>,
    <Box key={2} mt={2} className="cta-container" mb={2}>
      <MainCtaButton onClick={onEnterNewMissionFunnel}>
        Commencer une mission
      </MainCtaButton>
      <Button
        style={{ marginTop: 8 }}
        color="primary"
        onClick={() => {
          modals.open("history", { activityEventsByDay });
        }}
      >
        Voir mon historique
      </Button>
    </Box>
  ];
}
