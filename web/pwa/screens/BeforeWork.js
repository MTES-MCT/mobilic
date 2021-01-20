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
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Avatar from "@material-ui/core/Avatar";
import ListItemText from "@material-ui/core/ListItemText";
import {
  formatDayOfWeek,
  formatTimeOfDay,
  shortPrettyFormatDay
} from "common/utils/time";
import ListSubheader from "@material-ui/core/ListSubheader";
import orderBy from "lodash/orderBy";

const MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY = 5;

const useStyles = makeStyles(theme => ({
  container: {
    position: "relative",
    justifyContent: "flex-start",
    flexGrow: 1,
    flexShrink: 0,
    overflowY: "hidden"
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
  },
  welcomeText: {
    marginBottom: theme.spacing(2)
  },
  missionsToValidateList: {
    backgroundColor: theme.palette.background.paper,
    textAlign: "left",
    marginTop: theme.spacing(2),
    borderRadius: "24px 24px 0 0"
  },
  listHeader: {
    fontWeight: "bold",
    fontSize: "1.125rem"
  },
  listSubheader: {
    fontSize: "1rem",
    fontWeight: 500,
    display: "block",
    lineHeight: "1.25rem",
    color: theme.palette.grey[600]
  },
  missionDay: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 50,
    width: 65,
    color: theme.palette.text.primary,
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.grey[200]
  },
  missionName: {
    color: theme.palette.primary.main,
    fontWeight: "bold"
  },
  ellipsis: {
    color: theme.palette.grey[600]
  }
}));

export function BeforeWork({ beginNewMission, openHistory, missions }) {
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

  const missionsInHistory = missions.filter(m => m.isComplete && m.ended);
  const nonValidatedMissions = orderBy(
    missionsInHistory.filter(m => !m.validation),
    ["startTime"],
    ["desc"]
  );

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
        <Typography variant="h3" className={classes.welcomeText}>
          Bienvenue sur Mobilic !
        </Typography>
      </PlaceHolder>
    </Container>,
    <Box key={2} mt={2} className="cta-container" mb={2}>
      <MainCtaButton onClick={onEnterNewMissionFunnel}>
        Commencer une mission
      </MainCtaButton>
      <Button
        style={{ marginTop: 8 }}
        color="primary"
        onClick={() => openHistory()}
      >
        Voir mon historique
      </Button>
    </Box>,
    nonValidatedMissions.length > 0 && (
      <Box key={3} className={classes.missionsToValidateList}>
        <List
          subheader={
            <ListSubheader
              component="div"
              color="inherit"
              className={classes.listHeader}
            >
              Missions à valider
              <span className={classes.listSubheader}>
                Vérifiez les informations saisies par vous-même ou par vos
                coéquipiers
              </span>
            </ListSubheader>
          }
        >
          {nonValidatedMissions
            .slice(0, MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY)
            .map(m => (
              <MissionItem key={m.id} mission={m} openHistory={openHistory} />
            ))}
          {nonValidatedMissions.length >
            MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY && (
            <ListItem className={classes.ellipsis}>
              <Typography>
                +{" "}
                {nonValidatedMissions.length -
                  MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY}{" "}
                autre
                {nonValidatedMissions.length -
                  MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY >
                1
                  ? "s"
                  : ""}{" "}
                mission
                {nonValidatedMissions.length -
                  MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY >
                1
                  ? "s"
                  : ""}{" "}
                non validée
                {nonValidatedMissions.length -
                  MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY >
                1
                  ? "s"
                  : ""}
              </Typography>
            </ListItem>
          )}
        </List>
      </Box>
    )
  ];
}

function MissionItem({ mission, openHistory }) {
  const classes = useStyles();

  return (
    <ListItem
      button
      onClick={() => openHistory(mission.id, { previousPagePath: "/app" })}
    >
      <ListItemAvatar>
        <Avatar variant="rounded" className={classes.missionDay}>
          <Typography>{formatDayOfWeek(mission.startTime)}</Typography>
          <Typography className="bold">
            {shortPrettyFormatDay(mission.startTime)}
          </Typography>
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={`Mission ${mission.name || "sans nom"}`}
        primaryTypographyProps={{ className: classes.missionName }}
        secondary={`${formatTimeOfDay(mission.startTime)} - ${formatTimeOfDay(
          mission.endTime
        )}`}
      />
    </ListItem>
  );
}
