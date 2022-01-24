import React from "react";
import values from "lodash/values";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Typography from "@material-ui/core/Typography";
import {
  formatDateTime,
  formatTimeOfDay,
  getStartOfDay,
  textualPrettyFormatDay
} from "common/utils/time";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../../store/store";
import { LoadingButton } from "common/components/LoadingButton";
import { useModals } from "common/utils/modals";
import List from "@material-ui/core/List";
import { Event } from "../../../common/Event";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import {
  formatApiError,
  graphQLErrorMatchesCode,
  isGraphQLError
} from "common/utils/errors";
import {
  MISSION_QUERY,
  VALIDATE_MISSION_MUTATION
} from "common/utils/apiQueries";
import { editUserExpenditures } from "common/utils/expenditures";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Grid from "@material-ui/core/Grid";
import {
  missionHasActivities,
  missionHasAtLeastOneWorkerValidationAndNotAdmin,
  missionsSelector,
  missionValidatedByAdmin
} from "../../selectors/missionSelectors";
import { MissionVehicleInfo } from "../MissionVehicleInfo";
import { MissionLocationInfo } from "../MissionLocationInfo";
import { MissionEmployeeCard } from "../MissionEmployeeCard";
import ListItem from "@material-ui/core/ListItem";
import { ADMIN_ACTIONS } from "../../store/reducers/root";
import { useMissionActions } from "../../utils/missionActions";
import { useMissionWithStats } from "../../utils/missionWithStats";
import { MissionDetailsSection } from "../MissionDetailsSection";
import { MissionTitle } from "../MissionTitle";
import { MissionValidationInfo } from "../MissionValidationInfo";
import { useMissionDetailsStyles } from "./MissionDetailsStyle";
import {
  DEFAULT_LAST_ACTIVITY_TOO_LONG,
  missionCreatedByAdmin,
  missionLastUpdatedByAdmin
} from "common/utils/mission";
import { Alert } from "@material-ui/lab";
import { WarningModificationMission } from "./WarningModificationMission";
import { ACTIVITIES } from "common/utils/activities";

export function MissionDetails({
  missionId,
  day,
  handleClose,
  setShouldRefreshActivityPanel
}) {
  const classes = useMissionDetailsStyles();

  const adminStore = useAdminStore();
  const api = useApi();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  const [mission_, setMission] = React.useState(null);

  const missionActions = useMissionActions(
    mission_,
    setMission,
    setShouldRefreshActivityPanel
  );
  const mission = useMissionWithStats(mission_);

  const [loading, setLoading] = React.useState(false);
  const [missionLoadError, setMissionLoadError] = React.useState(false);

  const [usersToAdd, setUsersToAdd] = React.useState([]);

  async function loadMission() {
    const alreadyFetchedMission = missionsSelector(adminStore)?.find(
      m => m.id === missionId
    );
    if (alreadyFetchedMission) {
      setMission(alreadyFetchedMission);
    } else {
      setLoading(true);
      try {
        const missionPayload = await api.graphQlQuery(MISSION_QUERY, {
          id: missionId
        });
        const apiMission = {
          ...missionPayload.data.mission,
          companyId: missionPayload.data.mission.company.id
        };
        adminStore.dispatch({
          type: ADMIN_ACTIONS.create,
          payload: { items: [apiMission], entity: "missions" }
        });
        setMission(apiMission);
      } catch (err) {
        setMissionLoadError(formatApiError(err));
      }
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (missionId) loadMission();
  }, [missionId]);

  if (loading) return <CircularProgress color="primary" />;
  if (missionLoadError)
    return <Typography color="error">{missionLoadError}</Typography>;

  if (!mission) return null;

  const readOnlyMission =
    (missionValidatedByAdmin(mission) && missionHasActivities(mission)) ||
    (missionHasAtLeastOneWorkerValidationAndNotAdmin(mission) &&
      !missionCreatedByAdmin(mission, adminStore.employments) &&
      !missionLastUpdatedByAdmin(mission, adminStore.employments) &&
      mission.activities.every(a => a.submitterId !== adminStore.userId) &&
      !mission.missionNotUpdatedForTooLong);

  const missionCompany = adminStore.companies.find(
    c => c.id === mission.companyId
  );
  const showExpenditures =
    missionCompany && missionCompany.settings
      ? missionCompany.settings.requireExpenditures
      : false;

  const showKilometerReading =
    mission.vehicle && missionCompany && missionCompany.settings
      ? missionCompany.settings.requireKilometerData
      : false;

  const editableMissionName = missionCompany?.settings?.requireMissionName;

  const doesMissionSpanOnMultipleDays =
    mission.startTime &&
    mission.endTimeOrNow &&
    getStartOfDay(mission.startTime) !==
      getStartOfDay(mission.endTimeOrNow - 1);
  const dateTimeFormatter = doesMissionSpanOnMultipleDays
    ? formatDateTime
    : formatTimeOfDay;

  let entries = values(mission.userStats);
  const userIdsWithEntries = entries.map(e => e.user.id);
  usersToAdd.forEach(user => {
    if (!userIdsWithEntries.includes(user.id)) {
      entries.unshift({
        user,
        activities: [],
        activitiesWithBreaks: [],
        expenditures: []
      });
    }
  });

  entries.sort((e1, e2) => e1.user.id - e2.user.id);

  return (
    <Box p={2}>
      <Box pb={2} style={{ paddingBottom: "30px" }}>
        <Grid
          container
          spacing={2}
          justify="space-between"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid item>
            <MissionTitle
              name={mission.name}
              startTime={mission.startTime}
              onEdit={
                !readOnlyMission && editableMissionName
                  ? newName => missionActions.changeName(newName)
                  : null
              }
            />
          </Grid>
          <Grid>
            <IconButton
              aria-label="Fermer"
              className={classes.closeButton}
              onClick={handleClose}
            >
              <CloseIcon />
            </IconButton>
          </Grid>
        </Grid>
        {mission.name && (mission.startTime || day) && (
          <Typography variant="h6" className={classes.missionSubTitle}>
            Du {textualPrettyFormatDay(mission.startTime || day)}
            {doesMissionSpanOnMultipleDays ? (
              <span>
                {" "}
                au {textualPrettyFormatDay(mission.endTimeOrNow)}{" "}
                {mission.isComplete ? (
                  ""
                ) : (
                  <span className={classes.runningMissionText}>(en cours)</span>
                )}
              </span>
            ) : (
              ""
            )}
          </Typography>
        )}
      </Box>
      {!readOnlyMission && <WarningModificationMission />}
      {!readOnlyMission && mission.missionNotUpdatedForTooLong && (
        <Alert severity="warning" className={classes.missionTooLongWarning}>
          Vous pouvez modifier et valider cette mission car la dernière activité
          de votre salarié dure depuis plus de{" "}
          {DEFAULT_LAST_ACTIVITY_TOO_LONG / 3600} heures.
        </Alert>
      )}
      <Box className="flex-row" pb={4} style={{ alignItems: "center" }}>
        <Typography variant="h5" className={classes.vehicle}>
          Véhicule :
        </Typography>
        <MissionVehicleInfo
          vehicle={mission.vehicle}
          editVehicle={!readOnlyMission ? missionActions.updateVehicle : null}
          vehicles={adminStore.vehicles.filter(
            v => missionCompany && v.companyId === missionCompany.id
          )}
        />
      </Box>
      <Grid container justify="space-between" spacing={4}>
        <Grid item xs={12} sm={6}>
          <Typography variant="h5">Début</Typography>
          <MissionLocationInfo
            location={mission.startLocation}
            time={
              mission.startTime ? dateTimeFormatter(mission.startTime) : null
            }
            editLocation={
              !readOnlyMission
                ? address =>
                    missionActions.updateLocation(
                      address,
                      true,
                      mission.startLocation?.kilometerReading
                    )
                : null
            }
            editKm={
              !readOnlyMission
                ? km => missionActions.updateKilometerReading(km, true)
                : null
            }
            showKm={showKilometerReading}
            defaultAddresses={adminStore.knownAddresses.filter(
              a => missionCompany && a.companyId === missionCompany.id
            )}
            maxKmReading={mission.endLocation?.kilometerReading}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="h5">Fin</Typography>
          <MissionLocationInfo
            location={mission.endLocation}
            time={
              mission.startTime ? (
                <span>
                  {dateTimeFormatter(mission.endTimeOrNow)}{" "}
                  {mission.isComplete ? (
                    ""
                  ) : (
                    <span className={classes.runningMissionText}>
                      (en cours)
                    </span>
                  )}
                </span>
              ) : null
            }
            editLocation={
              !readOnlyMission
                ? address =>
                    missionActions.updateLocation(
                      address,
                      false,
                      mission.endLocation?.kilometerReading
                    )
                : null
            }
            editKm={
              !readOnlyMission
                ? km => missionActions.updateKilometerReading(km, false)
                : null
            }
            showKm={showKilometerReading}
            defaultAddresses={adminStore.knownAddresses.filter(
              a => missionCompany && a.companyId === missionCompany.id
            )}
            minKmReading={mission.startLocation?.kilometerReading}
          />
        </Grid>
      </Grid>
      {showKilometerReading &&
        mission.startLocation &&
        mission.startLocation.kilometerReading &&
        mission.endLocation &&
        mission.endLocation.kilometerReading &&
        mission.endLocation.kilometerReading >=
          mission.startLocation.kilometerReading && (
          <Typography variant="h5" className={classes.kilometers}>
            Distance parcourue :{" "}
            <span style={{ fontSize: "1rem", fontWeight: "normal" }}>
              {mission.endLocation.kilometerReading -
                mission.startLocation.kilometerReading}{" "}
              km
            </span>
          </Typography>
        )}
      <MissionDetailsSection
        key={3}
        title="Détail par employé"
        actionButtonLabel="Ajouter un employé"
        action={
          !readOnlyMission
            ? () => {
                modals.open("selectEmployee", {
                  users: adminStore.users.filter(
                    u =>
                      u.companyId === mission.companyId &&
                      !userIdsWithEntries.includes(u.id) &&
                      !usersToAdd.map(u2 => u2.id).includes(u.id)
                  ),
                  handleSelect: user =>
                    setUsersToAdd(users => [
                      ...users.filter(u => u.id !== user.id),
                      user
                    ])
                });
              }
            : null
        }
      >
        <List>
          {entries.map(e => (
            <ListItem key={e.user.id} disableGutters>
              <MissionEmployeeCard
                className={classes.employeeCard}
                mission={mission}
                user={e.user}
                showExpenditures={showExpenditures}
                onCreateActivity={
                  !readOnlyMission
                    ? () =>
                        modals.open("activityRevision", {
                          otherActivities: mission.activities,
                          createActivity: async args =>
                            await missionActions.createSingleActivity({
                              ...args,
                              user: e.user
                            }),
                          handleRevisionAction:
                            missionActions.editSingleActivity,
                          nullableEndTime: false,
                          defaultTime: mission.startTime,
                          forcedUser: e.user,
                          displayWarningMessage: false
                        })
                    : null
                }
                onEditActivity={
                  !readOnlyMission
                    ? async entry =>
                        modals.open("activityRevision", {
                          event: entry,
                          otherActivities:
                            entry.type === ACTIVITIES.break.name
                              ? mission.activities
                              : mission.activities.filter(
                                  a => a.startTime !== entry.startTime
                                ),
                          handleRevisionAction:
                            missionActions.editSingleActivity,
                          createActivity: async args =>
                            await missionActions.createSingleActivity({
                              ...args,
                              user: e.user
                            }),
                          nullableEndTime: false,
                          forcedUser: e.user,
                          displayWarningMessage: false
                        })
                    : null
                }
                onEditExpenditures={
                  !readOnlyMission
                    ? (newExps, oldExps) =>
                        editUserExpenditures(
                          newExps,
                          oldExps,
                          mission.id,
                          missionActions.createExpenditure,
                          missionActions.cancelExpenditure,
                          e.user.id
                        )
                    : null
                }
                removeUser={() =>
                  setUsersToAdd(users => users.filter(u => u.id !== e.user.id))
                }
                defaultOpen={entries.length === 1}
                day={day}
              />
            </ListItem>
          ))}
        </List>
      </MissionDetailsSection>
      <MissionDetailsSection
        key={4}
        title="Observations"
        actionButtonLabel="Ajouter une observation"
        action={() => {
          modals.open("commentInput", {
            handleContinue: missionActions.createComment
          });
        }}
      >
        {mission.comments.length > 0 ? (
          <List className={classes.comments}>
            {mission.comments.map(comment => (
              <Event
                key={comment.id}
                text={comment.text}
                time={comment.receptionTime}
                submitter={comment.submitter}
                submitterId={comment.submitterId}
                withFullDate={true}
                cancel={() => missionActions.deleteComment(comment)}
              />
            ))}
          </List>
        ) : (
          <Typography className={classes.noCommentText}>
            Aucune observation sur cette mission
          </Typography>
        )}
      </MissionDetailsSection>
      <MissionDetailsSection
        key={5}
        title="Validation gestionnaire"
        className={classes.validationSection}
      >
        {mission.adminGlobalValidation || readOnlyMission ? (
          <MissionValidationInfo
            validation={mission.adminGlobalValidation}
            isAdmin
            className={classes.adminValidation}
          />
        ) : (
          <Box>
            <Alert severity="info">
              <Typography className={classes.validationWarningText}>
                Il ne vous sera plus possible de modifier les données après
                validation.
              </Typography>
            </Alert>
            <LoadingButton
              aria-label="Valider"
              variant="contained"
              color="primary"
              size="small"
              className={classes.validationButton}
              onClick={async () => {
                let errorToDisplay = null;
                try {
                  const apiResponse = await api.graphQlMutate(
                    VALIDATE_MISSION_MUTATION,
                    {
                      missionId: mission.id
                    }
                  );
                  const validation =
                    apiResponse.data.activities.validateMission;
                  adminStore.dispatch({
                    type: ADMIN_ACTIONS.validateMission,
                    payload: { validation }
                  });
                  handleClose();
                } catch (err) {
                  if (
                    !(
                      isGraphQLError(err) &&
                      err.graphQLErrors.every(e =>
                        graphQLErrorMatchesCode(e, "NO_ACTIVITIES_TO_VALIDATE")
                      )
                    )
                  )
                    errorToDisplay = formatApiError(err);
                }
                if (errorToDisplay)
                  alerts.error(errorToDisplay, mission.id, 6000);
                else
                  alerts.success(
                    `La mission ${mission.name} a été validée avec succès !`,
                    mission.id,
                    6000
                  );
              }}
            >
              Valider toute la mission
            </LoadingButton>
          </Box>
        )}
      </MissionDetailsSection>
    </Box>
  );
}
