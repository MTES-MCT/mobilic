import React from "react";
import Container from "@material-ui/core/Container";
import { PlaceHolder } from "../../common/PlaceHolder";
import Typography from "@material-ui/core/Typography";
import { useModals } from "common/utils/modals";
import Box from "@material-ui/core/Box";
import { AccountButton } from "../components/AccountButton";
import { MainCtaButton } from "../components/MainCtaButton";
import Button from "@material-ui/core/Button";

export function BeforeWork({ beginNewMission, activityEventsByDay }) {
  const modals = useModals();

  const onEnterNewMissionFunnel = () => {
    modals.open("newMission", {
      handleContinue: missionInfos =>
        modals.open("teamOrSoloChoice", {
          handleContinue: isTeamMode => {
            const handleFirstActivitySelection = updatedCoworkers => {
              const team = updatedCoworkers
                ? updatedCoworkers
                    .filter(cw => !!cw.enroll)
                    .map(cw => ({
                      id: cw.id,
                      firstName: cw.firstName,
                      lastName: cw.lastName
                    }))
                : [];
              modals.open("firstActivity", {
                team,
                handleActivitySelection: (activityType, driver) => {
                  beginNewMission({
                    firstActivityType: activityType,
                    driver,
                    name: missionInfos.mission,
                    vehicleId: missionInfos.vehicle
                      ? missionInfos.vehicle.id
                      : null,
                    vehicleRegistrationNumber: missionInfos.vehicle
                      ? missionInfos.vehicle.registrationNumber
                      : null,
                    team
                  });
                  modals.closeAll();
                }
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

  return [
    <Container
      key={1}
      className="container scrollable"
      maxWidth={false}
      style={{ justifyContent: "flex-start", flexGrow: 1 }}
    >
      <AccountButton py={2} style={{ alignSelf: "flex-end" }} />
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
