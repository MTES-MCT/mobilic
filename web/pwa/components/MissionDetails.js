import { MissionReviewSection } from "./MissionReviewSection";
import DriveEtaIcon from "@mui/icons-material/DriveEta";
import { ActivityList } from "./ActivityList";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import {
  computeLatestEnrollmentStatuses,
  formatLatestEnrollmentStatus,
  resolveTeamAt
} from "common/utils/coworkers";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import {
  EXPENDITURES,
  regroupExpendituresSpendingDateByType
} from "common/utils/expenditures";
import React from "react";
import map from "lodash/map";
import omit from "lodash/omit";
import uniqBy from "lodash/uniqBy";
import max from "lodash/max";
import { makeStyles } from "@mui/styles";
import { useModals } from "common/utils/modals";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { getVehicleName } from "common/utils/vehicles";
import { PersonIcon } from "common/utils/icons";
import { getStartOfDay, now } from "common/utils/time";
import Typography from "@mui/material/Typography";
import { Event } from "../../common/Event";
import { useSnackbarAlerts } from "../../common/Snackbar";
import LocationEntry from "./LocationEntry";
import { ContradictoryChanges } from "./ContradictoryChanges";
import { useCacheContradictoryInfoInPwaStore } from "common/utils/contradictory";
import { DISMISSABLE_WARNINGS } from "../../admin/utils/dismissableWarnings";
import Notice from "../../common/Notice";
import { LoadingButton } from "common/components/LoadingButton";
import { MissionValidations } from "./MissionValidations";

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

export function MissionDetails({
  mission,
  activities = null,
  expenditures = null,
  editActivityEvent,
  nullableEndTimeInEditActivity = true,
  editExpenditures,
  editVehicle,
  previousMissionEnd,
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
  forceDisplayEndLocation = false,
  controlId = null,
  titleProps = {},
  hideHistory = false
}) {
  const classes = useStyles();
  const modals = useModals();
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();
  const actualUserId = userId || store.userId();
  const alerts = useSnackbarAlerts();

  const [
    currentlyEmployedInCompany,
    setCurrentlyEmployedInCompany
  ] = React.useState(false);

  React.useEffect(() => {
    setCurrentlyEmployedInCompany(
      mission?.company?.id &&
        store
          .companies()
          .map(c => c.id)
          .includes(mission.company.id)
    );
  }, [mission]);

  const actualCoworkers = coworkers || store.getEntity("coworkers");

  let teamChanges = omit(mission.teamChanges, [actualUserId]);

  const allowTeamActions =
    mission.company &&
    mission.company.settings &&
    mission.company.settings.allowTeamMode &&
    !mission.submittedBySomeoneElse;

  const allowSupportActivity =
    mission?.company?.settings?.requireSupportActivity || true;

  const allowOtherTask = mission.company?.settings?.allowOtherTask || true;
  const otherTaskLabel = mission.company?.settings?.otherTaskLabel || "";

  const teamAtMissionEnd = [
    actualUserId,
    ...resolveTeamAt(teamChanges, Math.min(untilTime || now(), now()))
  ];

  const teamMatesLatestStatuses = computeLatestEnrollmentStatuses(teamChanges);
  const hasTeamMates = Object.keys(teamMatesLatestStatuses).length > 0;

  const userActivities = activities
    ? activities.filter(a => a.userId === actualUserId)
    : mission.activities;

  const userExpenditures = expenditures
    ? expenditures.filter(e => e.userId === actualUserId)
    : mission.expenditures;

  const lastActivityTime =
    userActivities.length > 0
      ? max(userActivities.map(a => a.endTime || now()))
      : null;

  const expenditureForPeriod = userExpenditures?.filter(
    exp =>
      (!fromTime || new Date(exp.spendingDate).getTime() / 1000 >= fromTime) &&
      (!untilTime || new Date(exp.spendingDate).getTime() / 1000 < untilTime)
  );

  const disableActions =
    mission.isDeleted ||
    mission.validation ||
    mission.adminValidation ||
    !currentlyEmployedInCompany;

  const cacheContradictoryInfoInPwaStore = useCacheContradictoryInfoInPwaStore();

  async function handleMissionValidation() {
    const actualValidationFunc = async () => {
      await alerts.withApiErrorHandling(async () => {
        await validateMission(mission);
      }, "validate-mission");
    };
    if (
      !userInfo.disabledWarnings ||
      !userInfo.disabledWarnings.includes(
        DISMISSABLE_WARNINGS.EMPLOYEE_MISSION_VALIDATION
      )
    ) {
      modals.open("confirmation", {
        title: "Confirmer la validation",
        confirmButtonLabel: "Valider",
        cancelButtonLabel: "Annuler",
        disableWarningName: DISMISSABLE_WARNINGS.EMPLOYEE_MISSION_VALIDATION,
        content: (
          <Notice
            type="warning"
            description="Une fois la mission validée vous ne pourrez plus y apporter de
            modifications."
          />
        ),
        handleConfirm: actualValidationFunc
      });
    } else await actualValidationFunc();
  }

  return (
    <AlternateColors inverseColors={inverseColors}>
      {!hideHistory && (
        <MissionReviewSection title="Historique des validations">
          {mission.validations && (
            <MissionValidations
              mission={mission}
              validations={mission.validations}
              userId={userId}
            />
          )}
        </MissionReviewSection>
      )}
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
                  teamChanges,
                  nullableEndTime: nullableEndTimeInEditActivity,
                  allowTeamMode: allowTeamActions,
                  allowSupportActivity,
                  allowOtherTask,
                  otherTaskLabel,
                  defaultTime: lastActivityTime || defaultTime
                })
            : null
        }
        titleProps={titleProps}
      >
        <ActivityList
          activities={userActivities}
          allMissionActivities={mission.allActivities}
          editActivityEvent={!disableActions ? editActivityEvent : null}
          createActivity={args =>
            createActivity({
              ...args,
              missionId: mission.id
            })
          }
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
      (mission.company && mission.company.settings?.allowTeamMode) ? (
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
          titleProps={titleProps}
        >
          {hasTeamMates && (
            <>
              {changeTeam && (
                <Notice
                  type="warning"
                  sx={{ marginTop: 1 }}
                  description={
                    mission.submittedBySomeoneElse
                      ? `${mission.submitter.firstName} a choisi d'enregistrer le temps de travail pour toute l'équipe.  Il est conseillé d'attendre la fin de mission avant d'effectuer des modifications pour continuer de bénéficier des saisies de ${mission.submitter.firstName}. En effet, si vous saisissez ou modifiez une mission en cours de journée, vous serez exclu de l'équipe et ne serez donc plus concerné par les temps enregistrés ensuite pas le chef d'équipe.`
                      : `Vous avez choisi d'enregistrer le temps de travail pour toute l'équipe. Pensez à les en informer pour qu'ils continuent de bénéficier de vos saisies. En effet, s'ils saisissent ou modifient une activité en cours de journée, ils seront exclus de l'équipe et ne seront donc plus concernés par les temps que vous enregistrerez ensuite en tant que chef d'équipe.`
                  }
                />
              )}
              <List dense>
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
            </>
          )}
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
        titleProps={titleProps}
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
      <MissionReviewSection title="Lieux" titleProps={titleProps}>
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
            titleProps={titleProps}
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
          editButtonLabel={currentlyEmployedInCompany ? "Ajouter" : null}
          onEdit={
            logComment && currentlyEmployedInCompany
              ? () =>
                  modals.open("commentInput", {
                    handleContinue: text =>
                      logComment({ text, missionId: mission.id })
                  })
              : null
          }
          titleProps={titleProps}
        >
          <List dense className={classes.commentList}>
            {mission.comments
              ? mission.comments.map(comment => (
                  <Event
                    key={comment.id}
                    text={comment.text}
                    time={comment.receptionTime}
                    submitterId={comment.submitterId}
                    submitter={comment.submitter}
                    cancel={
                      cancelComment && currentlyEmployedInCompany
                        ? () => cancelComment(comment)
                        : null
                    }
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
      <MissionReviewSection title="Entreprise" titleProps={titleProps}>
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
      {!hideValidations &&
        validateMission &&
        !mission.adminValidation &&
        !mission.validation &&
        !mission.isDeleted && (
          <MissionReviewSection title="Validation" titleProps={titleProps}>
            <Box style={{ textAlign: "center" }} pt={2} pb={2}>
              <LoadingButton
                style={{ textAlign: "center" }}
                onClick={handleMissionValidation}
              >
                {validationButtonName}
              </LoadingButton>
            </Box>
          </MissionReviewSection>
        )}
      {!hideValidations &&
        (!validateMission ||
          mission.isDeleted ||
          mission.validation ||
          mission.adminValidation) && (
          <MissionReviewSection>
            <ContradictoryChanges
              mission={mission}
              validationTime={mission.validation?.receptionTime}
              userId={actualUserId}
              cacheInStore={cacheContradictoryInfoInPwaStore}
              controlId={controlId}
              titleProps={titleProps}
            />
          </MissionReviewSection>
        )}
    </AlternateColors>
  );
}
