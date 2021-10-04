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
import {
  EXPENDITURES,
  regroupExpendituresSpendingDateByType
} from "common/utils/expenditures";
import React from "react";
import map from "lodash/map";
import omit from "lodash/omit";
import uniqBy from "lodash/uniqBy";
import max from "lodash/max";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { getVehicleName } from "common/utils/vehicles";
import { PersonIcon } from "common/utils/icons";
import { formatDay, getStartOfDay, now } from "common/utils/time";
import { MainCtaButton } from "./MainCtaButton";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";
import ScheduleIcon from "@material-ui/icons/Schedule";
import { Comment } from "../../common/Comment";
import { useSnackbarAlerts } from "../../common/Snackbar";
import LocationEntry from "./LocationEntry";
import Alert from "@material-ui/lab/Alert";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { useApi } from "common/utils/api";
import { DISABLE_VALIDATION_WARNING_MUTATION } from "common/utils/apiQueries";

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

export function AlternateColors({ children, inverseColors = false }) {
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

// Checkbox component that is controlled by parent values but have as well an internal state.
// This is a hack allowing the component to be passed to a modal and properly rerender with user input (thanks to internal state) while also updating the controlled parent value.
// We need to do that because the component is passed to the modal as "static" prop and would not otherwise re-render with changes to its own props.
function CustomCheckbox({ setChecked, checked }) {
  const [internalChecked, setInternalChecked] = React.useState(checked);

  React.useEffect(() => {
    setChecked(internalChecked);
  }, [internalChecked]);

  return (
    <Checkbox
      checked={internalChecked}
      onChange={() => setInternalChecked(!internalChecked)}
    />
  );
}

export function MissionDetails({
  mission,
  editActivityEvent,
  nullableEndTimeInEditActivity = true,
  editExpenditures,
  editVehicle,
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
  editKilometerReading = null,
  defaultTime = null,
  disableEmptyActivitiesPlaceHolder = false,
  forceDisplayEndLocation = false
}) {
  const classes = useStyles();
  const modals = useModals();
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const actualUserId = userId || store.userId();
  const alerts = useSnackbarAlerts();

  const disableValidationWarning = React.useRef(false);

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

  const lastActivityTime =
    mission.activities.length > 0
      ? max(mission.activities.map(a => a.endTime || now()))
      : null;

  const expenditureForPeriod = mission.expenditures?.filter(
    exp =>
      (!fromTime || new Date(exp.spendingDate).getTime() / 1000 >= fromTime) &&
      (!untilTime || new Date(exp.spendingDate).getTime() / 1000 < untilTime)
  );

  const disableActions = mission.validation || mission.adminValidation;

  async function handleMissionValidation() {
    const actualValidationFunc = async () => {
      await alerts.withApiErrorHandling(async () => {
        await validateMission(mission);
      }, "validate-mission");
    };
    if (
      !userInfo.disabledWarnings ||
      !userInfo.disabledWarnings.includes("employee-validation")
    ) {
      modals.open("confirmation", {
        title: "Confirmer la validation",
        confirmButtonLabel: "Valider",
        cancelButtonLabel: "Annuler",
        content: (
          <>
            <Typography gutterBottom>
              ⚠️ Une fois la mission validée vous ne pourrez plus y apporter de
              modifications.
            </Typography>
            <FormControlLabel
              control={
                <CustomCheckbox
                  checked={!!disableValidationWarning.current}
                  setChecked={value => {
                    disableValidationWarning.current = value;
                  }}
                  size="small"
                />
              }
              label={
                <Typography variant="caption">
                  Ne plus afficher ce message
                </Typography>
              }
            />
          </>
        ),
        handleConfirm: async () => {
          try {
            if (disableValidationWarning.current) {
              await api.graphQlMutate(
                DISABLE_VALIDATION_WARNING_MUTATION,
                {},
                { context: { nonPublicApi: true } }
              );
            }
          } finally {
            await actualValidationFunc();
          }
        }
      });
    } else await actualValidationFunc();
  }

  return (
    <AlternateColors inverseColors={inverseColors}>
      <MissionReviewSection
        title="Activités"
        editButtonLabel="Ajouter"
        onEdit={
          createActivity && !disableActions
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
                  allowSupportActivity,
                  defaultTime: lastActivityTime || defaultTime
                })
            : null
        }
      >
        <ActivityList
          activities={mission.activities}
          allMissionActivities={mission.allActivities}
          editActivityEvent={!disableActions ? editActivityEvent : null}
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
          disableEmptyMessage={disableEmptyActivitiesPlaceHolder}
        />
      </MissionReviewSection>
      {hasTeamMates ||
      (mission.company && mission.company.settings.allowTeamMode) ? (
        <MissionReviewSection
          title={`${hasTeamMates ? "Coéquipiers" : "En solo"}`}
          onEdit={
            allowTeamActions && changeTeam && !disableActions
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
      <MissionReviewSection
        title="Véhicule"
        onEdit={
          editVehicle && !disableActions
            ? () =>
                modals.open("updateVehicle", {
                  handleSubmit: editVehicle,
                  currentVehicle: mission.vehicle,
                  company: mission.company
                })
            : null
        }
        editButtonLabel="Modifier"
      >
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
                mission.vehicle &&
                !disableActions
                  ? editKilometerReading
                  : null
              }
            />
            {(mission.ended || forceDisplayEndLocation) && (
              <LocationEntry
                mission={mission}
                location={mission.endLocation}
                isStart={false}
                editKilometerReading={
                  mission.company &&
                  mission.company.settings &&
                  mission.company.settings.requireKilometerData &&
                  mission.vehicle &&
                  !disableActions
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
                mission.company.settings.requireExpenditures) &&
              !disableActions
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
                      currentExpenditures: regroupExpendituresSpendingDateByType(
                        mission.expenditures
                      ),
                      missionStartTime: mission.startTime,
                      missionEndTime: mission.endTime
                    })
                : null
            }
          >
            <Box className={`flex-row ${classes.expenditures}`}>
              {expenditureForPeriod &&
                uniqBy(expenditureForPeriod, e => e.type).map(exp => (
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
                onClick={handleMissionValidation}
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
