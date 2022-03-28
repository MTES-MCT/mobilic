import React from "react";
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
import { formatApiError } from "common/utils/errors";
import { MISSION_QUERY } from "common/utils/apiQueries";
import { editUserExpenditures } from "common/utils/expenditures";
import CircularProgress from "@material-ui/core/CircularProgress/CircularProgress";
import Grid from "@material-ui/core/Grid";
import {
  missionHasAtLeastOneAdminValidation,
  missionsSelector
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
import { useMissionDetailsStyles } from "./MissionDetailsStyle";
import {
  DEFAULT_LAST_ACTIVITY_TOO_LONG,
  missionCreatedByAdmin
} from "common/utils/mission";
import { Alert } from "@material-ui/lab";
import { WarningModificationMission } from "./WarningModificationMission";
import { ACTIVITIES } from "common/utils/activities";
import {
  entryToBeValidatedByAdmin,
  missionToValidationEntries
} from "../../selectors/validationEntriesSelectors";
import { partition } from "lodash/collection";
import Button from "@material-ui/core/Button";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { VALIDATE_MISSION_IN_MISSION_PANEL } from "common/utils/matomoTags";

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
  const { trackEvent } = useMatomo();

  const [mission_, setMission] = React.useState(null);

  const [workerEntries, setWorkerEntries] = React.useState([]);

  const missionActions = useMissionActions(
    mission_,
    setMission,
    setShouldRefreshActivityPanel
  );
  const mission = useMissionWithStats(mission_);

  const [loading, setLoading] = React.useState(false);
  const [globalFieldsEditable, setGlobalFieldsEditable] = React.useState(false);
  const [missionLoadError, setMissionLoadError] = React.useState(false);
  const [
    adminMayOverrideValidation,
    setAdminMayOverrideValidation
  ] = React.useState(false);

  const [usersToAdd, setUsersToAdd] = React.useState([]);

  const [
    entriesToValidateByAdmin,
    setEntriesToValidateByAdmin
  ] = React.useState([]);
  const [
    entriesToValidateByWorker,
    setEntriesToValidateByWorker
  ] = React.useState([]);
  const [entriesValidatedByAdmin, setEntriesValidatedByAdmin] = React.useState(
    []
  );
  const [userIdsWithEntries, setUserIdsWithEntries] = React.useState(false);

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

  React.useEffect(() => {
    const partitionedList = partition(workerEntries, workerEntry =>
      entryToBeValidatedByAdmin(
        workerEntry,
        adminStore.userId,
        adminMayOverrideValidation
      )
    );
    setEntriesToValidateByAdmin(partitionedList[0]);
    const partitionedNoRequiredActionList = partition(
      partitionedList[1],
      workerEntry => workerEntry.adminValidation
    );
    setEntriesValidatedByAdmin(partitionedNoRequiredActionList[0]);
    setEntriesToValidateByWorker(partitionedNoRequiredActionList[1]);
  }, [workerEntries, adminMayOverrideValidation]);

  React.useEffect(() => {
    if (mission) {
      setAdminMayOverrideValidation(
        mission.missionTooOld ||
          mission.missionNotUpdatedForTooLong ||
          missionCreatedByAdmin(mission, adminStore.employments)
      );
    }
  }, [mission]);

  React.useEffect(() => {
    if (mission) {
      const entries = missionToValidationEntries(mission);
      entries.sort((e1, e2) => e1.user.id - e2.user.id);
      const userIdsInMission = entries.map(e => e.user.id);
      usersToAdd.forEach(user => {
        if (!userIdsInMission.includes(user.id)) {
          entries.unshift({
            user,
            activities: [],
            activitiesWithBreaks: [],
            expenditures: []
          });
        }
      });
      setUserIdsWithEntries(userIdsInMission);
      setWorkerEntries(entries);
    }
  }, [mission, usersToAdd]);

  React.useEffect(() => {
    setGlobalFieldsEditable(
      !missionHasAtLeastOneAdminValidation(mission) &&
        (entriesToValidateByAdmin?.length > 0 || adminMayOverrideValidation)
    );
  }, [entriesToValidateByAdmin, adminMayOverrideValidation]);

  if (loading) return <CircularProgress color="primary" />;
  if (missionLoadError)
    return <Typography color="error">{missionLoadError}</Typography>;

  if (!mission) return null;

  const adminSettings = adminStore.settings;

  const missionCompany = adminStore.companies.find(
    c => c.id === mission.companyId
  );
  const showExpenditures = adminSettings.requireExpenditures;
  const showKilometerReading = adminSettings.requireKilometerData;
  const allowTransfers = adminSettings.allowTransfers;
  const allowSupportActivity = adminSettings.requireSupportActivity;
  const editableMissionName = adminSettings.requireMissionName;

  const doesMissionSpanOnMultipleDays =
    mission.startTime &&
    mission.endTimeOrNow &&
    getStartOfDay(mission.startTime) !==
      getStartOfDay(mission.endTimeOrNow - 1);
  const dateTimeFormatter = doesMissionSpanOnMultipleDays
    ? formatDateTime
    : formatTimeOfDay;

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
                globalFieldsEditable && editableMissionName
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
      {globalFieldsEditable && <WarningModificationMission />}
      {globalFieldsEditable && mission.missionNotUpdatedForTooLong && (
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
          editVehicle={
            globalFieldsEditable ? missionActions.updateVehicle : null
          }
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
              globalFieldsEditable
                ? address =>
                    missionActions.updateLocation(
                      address,
                      true,
                      mission.startLocation?.kilometerReading
                    )
                : null
            }
            editKm={
              globalFieldsEditable
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
              globalFieldsEditable
                ? address =>
                    missionActions.updateLocation(
                      address,
                      false,
                      mission.endLocation?.kilometerReading
                    )
                : null
            }
            editKm={
              globalFieldsEditable
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
      <Box
        pb={4}
        style={{ alignItems: "center" }}
        className={classes.observationSection}
      >
        <Grid container spacing={2} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h5" className={classes.vehicle}>
              Observations
            </Typography>
          </Grid>
          <Grid item>
            <Button
              aria-label="Ajouter une observation"
              color="primary"
              variant="outlined"
              size="small"
              className={classes.smallTextButton}
              onClick={() => {
                modals.open("commentInput", {
                  handleContinue: missionActions.createComment
                });
              }}
            >
              Ajouter une observation
            </Button>
          </Grid>
        </Grid>
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
      </Box>
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
      {(entriesToValidateByAdmin?.length > 0 ||
        workerEntries?.length === 0) && (
        <MissionDetailsSection
          key={3}
          title="Saisies à valider"
          actionButtonLabel="Ajouter un employé"
          className={classes.validationSection}
          action={
            globalFieldsEditable
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
            {entriesToValidateByAdmin.map(e => (
              <ListItem key={e.user.id} disableGutters>
                <MissionEmployeeCard
                  className={classes.employeeCard}
                  mission={mission}
                  user={e.user}
                  showExpenditures={showExpenditures}
                  onCreateActivity={
                    entryToBeValidatedByAdmin(
                      e,
                      adminStore.userId,
                      adminMayOverrideValidation
                    ) || !e.activities
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
                            allowTransfers,
                            allowSupportActivity,
                            nullableEndTime: false,
                            defaultTime: mission.startTime,
                            forcedUser: e.user,
                            displayWarningMessage: false
                          })
                      : null
                  }
                  onEditActivity={
                    entryToBeValidatedByAdmin(
                      e,
                      adminStore.userId,
                      adminMayOverrideValidation
                    ) || !e.activities
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
                            allowTransfers,
                            allowSupportActivity,
                            nullableEndTime: false,
                            forcedUser: e.user,
                            displayWarningMessage: false
                          })
                      : null
                  }
                  onEditExpenditures={
                    entryToBeValidatedByAdmin(
                      e,
                      adminStore.userId,
                      adminMayOverrideValidation
                    ) || !e.activities
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
                    setUsersToAdd(users =>
                      users.filter(u => u.id !== e.user.id)
                    )
                  }
                  defaultOpen={workerEntries.length === 1}
                  day={day}
                  displayIcon={false}
                />
              </ListItem>
            ))}
          </List>
          {entriesToValidateByAdmin?.length > 0 && (
            <Box>
              <Alert severity="info">
                <Typography className={classes.validationWarningText}>
                  Il ne vous sera plus possible de modifier les données après
                  validation, y compris les données globales de la mission
                  (Lieux, Véhicules).
                </Typography>
              </Alert>
              <LoadingButton
                aria-label="Valider"
                variant="contained"
                color="primary"
                size="small"
                className={classes.validationButton}
                onClick={async e => {
                  e.stopPropagation();
                  trackEvent(VALIDATE_MISSION_IN_MISSION_PANEL);
                  entriesToValidateByAdmin.map(workerEntryToValidate => {
                    missionActions.validateMission(
                      workerEntryToValidate.user.id
                    );
                  });
                }}
              >
                Valider les saisies
              </LoadingButton>
            </Box>
          )}
        </MissionDetailsSection>
      )}
      {entriesToValidateByWorker?.length > 0 && (
        <MissionDetailsSection key={6} title="Saisies en cours">
          <Alert severity="info">
            <Typography className={classes.validationWarningText}>
              Vous aurez accès à la validation de ces saisies lorsque le salarié
              les aura validées.
            </Typography>
          </Alert>
          <List>
            {entriesToValidateByWorker.map(e => (
              <ListItem key={e.user.id} disableGutters>
                <MissionEmployeeCard
                  className={classes.employeeCard}
                  mission={mission}
                  user={e.user}
                  showExpenditures={showExpenditures}
                  day={day}
                />
              </ListItem>
            ))}
          </List>
        </MissionDetailsSection>
      )}
      {entriesValidatedByAdmin?.length > 0 && (
        <MissionDetailsSection key={7} title="Saisies validées">
          <List>
            {entriesValidatedByAdmin.map(e => (
              <ListItem key={e.user.id} disableGutters>
                <MissionEmployeeCard
                  className={classes.employeeCard}
                  mission={mission}
                  user={e.user}
                  showExpenditures={showExpenditures}
                  day={day}
                  displayIcon={false}
                />
              </ListItem>
            ))}
          </List>
        </MissionDetailsSection>
      )}
    </Box>
  );
}
