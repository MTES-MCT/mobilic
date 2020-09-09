import React from "react";
import Container from "@material-ui/core/Container";
import { PlaceHolder } from "../../common/PlaceHolder";
import Typography from "@material-ui/core/Typography";
import { ReactComponent as HomeIcon } from "common/assets/images/Home.svg";
import { useModals } from "common/utils/modals";
import Box from "@material-ui/core/Box";
import { AccountButton } from "../components/AccountButton";
import { MainCtaButton } from "../components/MainCtaButton";
import Button from "@material-ui/core/Button";
import SvgIcon from "@material-ui/core/SvgIcon";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";

const useStyles = makeStyles(theme => ({
  container: {
    position: "relative",
    justifyContent: "flex-start",
    flexGrow: 1
  },
  heroImage: {
    width: "100%",
    height: "auto",
    color: theme.palette.background.default
  },
  accountButton: {
    alignSelf: "flex-end",
    position: "absolute",
    top: "0",
    right: "0"
  }
}));

export function BeforeWork({ beginNewMission, missions }) {
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();

  const onEnterNewMissionFunnel = () => {
    modals.open("newMission", {
      handleContinue: missionInfos =>
        modals.open("teamOrSoloChoice", {
          handleContinue: isTeamMode => {
            const handleFirstActivitySelection = updatedCoworkers => {
              const team = updatedCoworkers
                ? [store.userId(), ...updatedCoworkers.map(cw => cw.id)]
                : [store.userId()];
              modals.open("firstActivity", {
                team,
                handleActivitySelection: (activityType, driverId) => {
                  beginNewMission({
                    firstActivityType: activityType,
                    driverId,
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
                mission: null,
                handleContinue: handleFirstActivitySelection
              });
            } else handleFirstActivitySelection(null);
          }
        })
    });
  };

  const classes = useStyles();

  return [
    <Container
      key={1}
      className={`container ${classes.container}`}
      disableGutters
      maxWidth={false}
    >
      <AccountButton p={2} className={classes.accountButton} />
      <SvgIcon
        viewBox="0 0 506 382"
        className={classes.heroImage}
        component={HomeIcon}
      />
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
          modals.open("history", { missions });
        }}
      >
        Voir mon historique
      </Button>
    </Box>
  ];
}
