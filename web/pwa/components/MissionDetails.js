import { MissionReviewSection } from "./MissionReviewSection";
import DriveEtaIcon from "@material-ui/icons/DriveEta";
import { ActivityList } from "./ActivityList";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import {
  computeLatestEnrollmentStatuses,
  formatLatestEnrollmentStatus,
  resolveTeamAt
} from "common/utils/coworkers";
import Box from "@material-ui/core/Box";
import Chip from "@material-ui/core/Chip";
import { EXPENDITURES } from "common/utils/expenditures";
import React from "react";
import map from "lodash/map";
import omit from "lodash/omit";
import fromPairs from "lodash/fromPairs";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { getVehicleName } from "common/utils/vehicles";
import { PersonIcon } from "common/utils/icons";
import { formatDay, getStartOfDay, now } from "common/utils/time";
import { MainCtaButton } from "./MainCtaButton";
import * as Sentry from "@sentry/browser";
import Typography from "@material-ui/core/Typography";
import { formatApiError } from "common/utils/errors";
import CheckIcon from "@material-ui/icons/Check";
import ScheduleIcon from "@material-ui/icons/Schedule";
import { Comment } from "../../common/Comment";
import { useSnackbarAlerts } from "../../common/Snackbar";
import LocationEntry from "./LocationEntry";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles(theme => ({
  backgroundPaper: {
    backgroundColor: theme.palette.background.paper
  },
  backgroundNormal: {
    backgroundColor: theme.palette.background.default
  },
  expenditures: {
    flexWrap: "wrap",
    textAlign: "left",
    textTransform: "capitalize",
    "& > *": {
      margin: theme.spacing(0.5)
    }
  },
  validationText: {
    paddingLeft: theme.spacing(1)
  },
  validationContainer: {
    display: "flex",
    alignItems: "center"
  },
  commentList: {
    paddingLeft: theme.spacing(3)
  },
  kilometerReading: {
    flexGrow: 0
  },
  teamModeAlert: {
    marginTop: theme.spacing(1),
    textAlign: "left"
  },
  kilometers: {
    paddingTop: theme.spacing(1),
    textAlign: "left"
  }
}));

function AlternateColors({ children, inverseColors = false }) {
  const classes = useStyles();
  const firstColor = inverseColors
    ? classes.backgroundPaper
    : classes.backgroundNormal;
  const secondColor = inverseColors
    ? classes.backgroundNormal
    : classes.backgroundPaper;
  return React.Children.toArray(children)
    .filter(Boolean)
    .map((child, index) => (
      <Box
        key={index}
        className={index % 2 === 1 ? secondColor : firstColor}
        mb={index === React.Children.count(children) - 1 ? 2 : 0}
      >
        {child}
      </Box>
    ));
}

export function MissionDetails({
  mission,
  editActivityEvent,
  nullableEndTimeInEditActivity = true,
  editExpenditures,
  previousMissionEnd,
  nextMissionStart,
  hideExpenditures,
  hideComments,
  logComment,
  cancelComment,
  createActivity,
  changeTeam,
  hideValidations,
  validateMission,
  validationButtonName = "Valider et Envoyer",
  inverseColors = false,
  isMissionEnded = true,
  coworkers = null,
  userId = null,
  fromTime = null,
  untilTime = null,
  editKilometerReading = null
}) {
  const classes = useStyles();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const actualUserId = userId || store.userId();
  const alerts = useSnackbarAlerts();

  const actualCoworkers = coworkers || store.getEntity("coworkers");

  let teamChanges = omit(mission.teamChanges, [actualUserId]);

  const allowTeamActions =
    mission.company &&
    mission.company.settings &&
    mission.company.settings.allowTeamMode &&
    !mission.submittedBySomeoneElse;

  const allowSupportActivity =
    !mission.company ||
    !mission.company.settings ||
    mission.company.settings.requireSupportActivity;

  const teamAtMissionEnd = [
    actualUserId,
    ...resolveTeamAt(teamChanges, Math.min(untilTime || now(), now()))
  ];

  const teamMatesLatestStatuses = computeLatestEnrollmentStatuses(teamChanges);
  const hasTeamMates = Object.keys(teamMatesLatestStatuses).length > 0;

  return (
    <AlternateColors inverseColors={inverseColors}>
      <MissionReviewSection
        title="Activités"
        editButtonLabel="Ajouter"
        onEdit={
          createActivity
            ? () =>
                modals.open("activityRevision", {
                  otherActivities: mission.allActivities,
                  createActivity: args =>
                    createActivity({
                      ...args,
                      missionId: mission.id
                    }),
                  handleRevisionAction: (
                    activity,
                    actionType,
                    newUserStartTime,
                    newUserEndTime,
                    userComment,
                    forAllTeam
                  ) =>
                    editActivityEvent(
                      activity,
                      actionType,
                      newUserStartTime,
                      newUserEndTime,
                      userComment,
                      forAllTeam
                    ),
                  previousMissionEnd,
                  nextMissionStart,
                  teamChanges,
                  nullableEndTime: nullableEndTimeInEditActivity,
                  allowTeamMode: allowTeamActions,
                  allowSupportActivity
                })
            : null
        }
      >
        <ActivityList
          activities={mission.activities}
          allMissionActivities={mission.allActivities}
          editActivityEvent={editActivityEvent}
          createActivity={args =>
            createActivity({
              ...args,
              missionId: mission.id
            })
          }
          nextMissionStart={nextMissionStart}
          previousMissionEnd={previousMissionEnd}
          teamChanges={teamChanges}
          allowTeamMode={allowTeamActions}
          nullableEndTimeInEditActivity={nullableEndTimeInEditActivity}
          isMissionEnded={isMissionEnded}
          fromTime={fromTime}
          untilTime={untilTime}
        />
      </MissionReviewSection>
      {hasTeamMates ||
      (mission.company && mission.company.settings.allowTeamMode) ? (
        <MissionReviewSection
          title={`${hasTeamMates ? "Coéquipiers" : "En solo"}`}
          onEdit={
            allowTeamActions && changeTeam
              ? () =>
                  modals.open("teamSelection", {
                    mission: mission,
                    handleContinue: changeTeam,
                    closeOnContinue: true
                  })
              : null
          }
          editButtonLabel="Changer"
        >
          {hasTeamMates && [
            changeTeam && (
              <Alert
                severity="info"
                color="warning"
                key={0}
                className={classes.teamModeAlert}
              >
                {mission.submittedBySomeoneElse
                  ? `${mission.submitter.firstName} a choisi d'enregistrer le temps de travail pour toute l'équipe. Vous avez la possibilité de modifier les activités et frais vous concernant mais il est conseillé d'attendre la fin de mission pour éviter la double saisie.`
                  : `Vous avez choisi d'enregistrer le temps de travail pour toute l'équipe. Pensez à les en informer afin d'éviter la double saisie.`}
              </Alert>
            ),
            <List key={1} dense>
              {map(teamMatesLatestStatuses, (tc, id) => (
                <ListItem disableGutters key={id}>
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      actualCoworkers[tc.userId.toString()]
                        ? actualCoworkers[tc.userId.toString()].firstName
                        : "Inconnu"
                    }
                    secondary={formatLatestEnrollmentStatus(tc)}
                  />
                </ListItem>
              ))}
            </List>
          ]}
        </MissionReviewSection>
      ) : null}
      <MissionReviewSection title="Véhicule">
        {mission.vehicle && (
          <List dense>
            <ListItem disableGutters>
              <ListItemIcon>
                <DriveEtaIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  mission.vehicle.id
                    ? getVehicleName(mission.vehicle, true)
                    : mission.vehicle.registrationNumber
                }
              />
            </ListItem>
          </List>
        )}
      </MissionReviewSection>
      <MissionReviewSection title="Lieux">
        {(mission.startLocation || mission.endLocation) && (
          <List dense>
            <LocationEntry
              mission={mission}
              location={mission.startLocation}
              isStart={true}
              editKilometerReading={
                mission.company &&
                mission.company.settings &&
                mission.company.settings.requireKilometerData &&
                mission.vehicle
                  ? editKilometerReading
                  : null
              }
            />
            {mission.ended && (
              <LocationEntry
                mission={mission}
                location={mission.endLocation}
                isStart={false}
                editKilometerReading={
                  mission.company &&
                  mission.company.settings &&
                  mission.company.settings.requireKilometerData &&
                  mission.vehicle
                    ? editKilometerReading
                    : null
                }
              />
            )}
          </List>
        )}
        {mission.startLocation &&
          mission.startLocation.kilometerReading &&
          mission.endLocation &&
          mission.endLocation.kilometerReading &&
          mission.endLocation.kilometerReading >=
            mission.startLocation.kilometerReading && (
            <Typography className={classes.kilometers}>
              Distance parcourue :{" "}
              {mission.endLocation.kilometerReading -
                mission.startLocation.kilometerReading}{" "}
              km
            </Typography>
          )}
      </MissionReviewSection>
      {!hideExpenditures &&
        (!mission.company ||
          !mission.company.settings ||
          mission.company.settings.requireExpenditures ||
          mission.expenditures.length > 0) && (
          <MissionReviewSection
            title="Frais"
            onEdit={
              editExpenditures &&
              (!mission.company ||
                !mission.company.settings ||
                mission.company.settings.requireExpenditures)
                ? () =>
                    modals.open("expenditures", {
                      handleSubmit: (expenditures, forAllTeam) =>
                        editExpenditures(
                          expenditures,
                          mission.expenditures,
                          mission.id,
                          forAllTeam ? teamAtMissionEnd : []
                        ),
                      hasTeamMates:
                        allowTeamActions && teamAtMissionEnd.length > 1,
                      currentExpenditures: fromPairs(
                        uniq(mission.expenditures.map(e => [e.type, true]))
                      )
                    })
                : null
            }
          >
            <Box className={`flex-row ${classes.expenditures}`}>
              {mission.expenditures &&
                uniqBy(mission.expenditures, e => e.type).map(exp => (
                  <Chip key={exp.type} label={EXPENDITURES[exp.type].label} />
                ))}
            </Box>
          </MissionReviewSection>
        )}
      {!hideComments && (
        <MissionReviewSection
          title="Observations"
          editButtonLabel="Ajouter"
          onEdit={
            logComment
              ? () =>
                  modals.open("commentInput", {
                    handleContinue: text =>
                      logComment({ text, missionId: mission.id })
                  })
              : null
          }
        >
          <List dense className={classes.commentList}>
            {mission.comments
              ? mission.comments.map(comment => (
                  <Comment
                    key={comment.id}
                    comment={comment}
                    cancelComment={cancelComment}
                    withFullDate={
                      getStartOfDay(comment.receptionTime) !==
                      getStartOfDay(mission.startTime)
                    }
                  />
                ))
              : null}
          </List>
        </MissionReviewSection>
      )}
      <MissionReviewSection title="Entreprise">
        <List dense>
          <ListItem disableGutters>
            <ListItemText
              primary={
                mission.company
                  ? `${mission.company.name}${
                      mission.company.siren
                        ? ` (SIREN ${mission.company.siren})`
                        : ""
                    }`
                  : ""
              }
            />
          </ListItem>
        </List>
      </MissionReviewSection>
      {!hideValidations && (
        <MissionReviewSection title="">
          {validateMission && !mission.adminValidation && !mission.validation && (
            <Box style={{ textAlign: "center" }} pt={2} pb={2}>
              <MainCtaButton
                style={{ textAlign: "center" }}
                onClick={async () => {
                  try {
                    await validateMission(mission);
                  } catch (err) {
                    Sentry.captureException(err);
                    console.log(err);
                    alerts.error(formatApiError(err), "validate-mission", 6000);
                  }
                }}
              >
                {validationButtonName}
              </MainCtaButton>
            </Box>
          )}
          {(!validateMission ||
            mission.validation ||
            mission.adminValidation) && (
            <>
              {!mission.adminValidation && (
                <Box
                  color={mission.validation ? "success.main" : "warning.main"}
                  className={classes.validationContainer}
                >
                  {mission.validation ? (
                    <CheckIcon fontSize="small" color="inherit" />
                  ) : (
                    <ScheduleIcon fontSize="small" color="inherit" />
                  )}
                  <Typography className={classes.validationText}>
                    {mission.validation
                      ? `validée le ${formatDay(
                          mission.validation.receptionTime
                        )}`
                      : "en attente de validation salarié"}
                  </Typography>
                </Box>
              )}
              {(mission.adminValidation || mission.validation) && (
                <Box
                  color={
                    mission.adminValidation ? "success.main" : "warning.main"
                  }
                  className={classes.validationContainer}
                >
                  {mission.adminValidation ? (
                    <CheckIcon fontSize="small" color="inherit" />
                  ) : (
                    <ScheduleIcon fontSize="small" color="inherit" />
                  )}
                  <Typography className={classes.validationText}>
                    {mission.adminValidation
                      ? `validée par le gestionnaire le ${formatDay(
                          mission.adminValidation.receptionTime
                        )}`
                      : "en attente de validation gestionnaire"}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </MissionReviewSection>
      )}
    </AlternateColors>
  );
}
