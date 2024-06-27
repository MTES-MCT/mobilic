import React from "react";
import Container from "@mui/material/Container";
import { PlaceHolder } from "../../common/PlaceHolder";
import Typography from "@mui/material/Typography";
import { useModals } from "common/utils/modals";
import Box from "@mui/material/Box";
import { AccountButton } from "../components/AccountButton";
import { makeStyles } from "@mui/styles";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import {
  DAY,
  formatDayOfWeek,
  formatTimeOfDay,
  prettyFormatDay,
  shortPrettyFormatDay,
  startOfDay
} from "common/utils/time";
import ListSubheader from "@mui/material/ListSubheader";
import orderBy from "lodash/orderBy";
import { LoadingButton } from "common/components/LoadingButton";
import { useLoadingScreen } from "common/utils/loading";
import BackgroundImage from "common/assets/images/landing-hero-vertical-without-text-logo.svg";
import LogoWithText from "common/assets/images/mobilic-logo-white-with-text.svg";
import { shouldDisplayEmployeeSocialImpactSurveyOnMainPage } from "common/utils/surveys";
import { usePageTitle } from "../../common/UsePageTitle";

import DateRangeIcon from "@mui/icons-material/DateRange";
import Stack from "@mui/material/Stack";
import { useHolidays } from "../../common/useHolidays";
import { WarningBreaks } from "../components/WarningBreaks";
import { useEnoughBreak } from "../../common/useEnoughBreak";

const MAX_NON_VALIDATED_MISSIONS_TO_DISPLAY = 5;

const useStyles = makeStyles(theme => ({
  outer: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    background: `url(${BackgroundImage}) 50%`,
    backgroundSize: "cover",
    position: "relative"
  },
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
    textAlign: "justify",
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
  },
  ctaButton: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.primary.main,
    "&:hover": {
      "--hover-tint": theme.palette.background.default,
      color: theme.palette.primary.main
    },
    marginTop: theme.spacing(2)
  },
  subButton: {
    color: theme.palette.primary.contrastText
  },
  promiseText: {
    color: theme.palette.primary.contrastText,
    fontStyle: "italic"
  },
  holidayButton: {
    textDecoration: "underline",
    textTransform: "none"
  }
}));

export function BeforeWork({ beginNewMission, openHistory, missions }) {
  usePageTitle("Saisie Temps - Mobilic");
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const withLoadingScreen = useLoadingScreen();
  const { openHolidaysModal } = useHolidays();
  const { hasEnoughBreak } = useEnoughBreak();

  const companies = store.companies();
  const userId = store.userId();
  const userInfo = store.userInfo();

  function handleFirstActivitySelection(teamMates, missionInfos) {
    const team = teamMates ? [userId, ...teamMates.map(cw => cw.id)] : [userId];
    modals.open("firstActivity", {
      team,
      handleActivitySelection: async (
        activityType,
        driverId,
        vehicle,
        kilometerReading
      ) => {
        await withLoadingScreen(
          async () => {
            await beginNewMission({
              firstActivityType: activityType,
              driverId,
              companyId: missionInfos.company.id,
              name: missionInfos.mission,
              vehicle: vehicle || missionInfos.vehicle || null,
              startLocation: missionInfos.address,
              kilometerReading:
                kilometerReading || missionInfos.kilometerReading,
              team
            });
            await modals.closeAll();
          },
          {},
          true
        );
      },
      requireVehicle: !missionInfos.vehicle,
      company: missionInfos.company
    });
  }

  const onEnterNewMissionFunnel = () => {
    modals.open("newMission", {
      companies,
      companyAddresses: store.getEntity("knownAddresses"),
      handleContinue: missionInfos => {
        const company = companies.find(c => c.id === missionInfos.company.id);
        if (company.settings && company.settings.allowTeamMode) {
          modals.open("teamOrSoloChoice", {
            handleContinue: isTeamMode => {
              if (isTeamMode) {
                modals.open("teamSelection", {
                  mission: null,
                  companyId: missionInfos.company.id,
                  handleContinue: teamMates =>
                    handleFirstActivitySelection(teamMates, missionInfos)
                });
              } else handleFirstActivitySelection(null, missionInfos);
            }
          });
        } else handleFirstActivitySelection(null, missionInfos);
      }
    });
  };

  const onEnterNewHolidayFunnel = () => openHolidaysModal();

  const classes = useStyles();

  const currentTime = startOfDay(new Date(Date.now()));

  const missionsInHistory = missions.filter(m => m.isComplete && m.ended);
  const nonValidatedMissions = orderBy(
    missionsInHistory.filter(
      m =>
        !m.isDeleted &&
        !m.validation &&
        !m.adminValidation &&
        m.startTime >= currentTime - DAY * 31
    ),
    ["startTime"],
    ["desc"]
  );

  React.useEffect(() => {
    if (
      shouldDisplayEmployeeSocialImpactSurveyOnMainPage(userInfo, companies)
    ) {
      modals.open("typeformModal", {
        typeformId: process.env.REACT_APP_SURVEY_EMPLOYEE_SOCIAL_IMPACT,
        userId: userId
      });
    }
  }, []);

  return (
    <Container maxWidth={false} className={classes.outer} disableGutters>
      <AccountButton p={2} className={classes.accountButton} darkBackground />
      <PlaceHolder>
        <img alt="mobilic-logo-text" src={LogoWithText} width={150} />
      </PlaceHolder>
      <Box key={2} mt={2} className="cta-container" mb={2}>
        <Typography className={classes.promiseText}>
          Le suivi de votre temps de travail
        </Typography>
        <Typography className={`${classes.promiseText} bold`}>
          Fiable, facile et rapide !
        </Typography>
        {!hasEnoughBreak && <WarningBreaks />}
        <LoadingButton
          variant="contained"
          className={classes.ctaButton}
          onClick={onEnterNewMissionFunnel}
        >
          Commencer une mission
        </LoadingButton>
        <LoadingButton
          style={{ marginTop: 8 }}
          className={classes.subButton}
          onClick={() => {
            openHistory();
          }}
        >
          Voir mon historique
        </LoadingButton>
        <LoadingButton
          style={{ marginTop: 2 }}
          className={classes.subButton}
          onClick={() => {
            onEnterNewHolidayFunnel();
          }}
        >
          <Stack direction="row" spacing={1}>
            <DateRangeIcon />
            <Typography className={classes.holidayButton}>
              Renseigner une indisponibilité
            </Typography>
          </Stack>
        </LoadingButton>
      </Box>
      {nonValidatedMissions.length > 0 && (
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
      )}
    </Container>
  );
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
          <Typography style={{ textTransform: "uppercase" }}>
            {formatDayOfWeek(mission.startTime)}
          </Typography>
          <Typography className="bold">
            {shortPrettyFormatDay(mission.startTime)}
          </Typography>
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={`Mission ${mission.name ||
          `du ${prettyFormatDay(mission.startTime)}`}`}
        primaryTypographyProps={{ className: classes.missionName }}
        secondary={`${formatTimeOfDay(mission.startTime)} - ${formatTimeOfDay(
          mission.endTime
        )}`}
      />
    </ListItem>
  );
}
