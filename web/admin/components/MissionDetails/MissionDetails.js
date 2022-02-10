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
  adminValidations,
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
import { AdminValidationInfo } from "../AdminValidationInfo";
import { ListItemIcon, ListItemText } from "@material-ui/core";
import { formatPersonName } from "common/utils/coworkers";

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

  const [entriesToValidate, setEntriesToValidate] = React.useState([]);
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
    setEntriesToValidate(
      workerEntries.filter(workerEntry =>
        entryToBeValidatedByAdmin(
          workerEntry,
          adminStore.userId,
          adminMayOverrideValidation
        )
      )
    );
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
        (entriesToValidate?.length > 0 || adminMayOverrideValidation)
    );
  }, [entriesToValidate, adminMayOverrideValidation]);

  if (loading) return <CircularProgress color="primary" />;
  if (missionLoadError)
    return <Typography color="error">{missionLoadError}</Typography>;

  if (!mission) return null;

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
          {workerEntries.map(e => (
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
                  setUsersToAdd(users => users.filter(u => u.id !== e.user.id))
                }
                defaultOpen={workerEntries.length === 1}
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
      {entriesToValidate?.length > 0 && (
        <MissionDetailsSection
          key={5}
          title="Validation gestionnaire"
          className={classes.validationSection}
        >
          <Box>
            <Alert severity="info">
              <Typography className={classes.validationWarningText}>
                Il ne vous sera plus possible de modifier les données après
                validation.
              </Typography>
            </Alert>
            <Typography className={classes.entriesToValidate}>
              Les saisies suivantes sont à valider :
              <List disablePadding>
                {globalFieldsEditable && (
                  <ListItem
                    dense
                    className={classes.userToValidateEntry}
                    key={entriesToValidate.user?.id}
                  >
                    <ListItemIcon className={classes.userToValidateIcon}>
                      👉
                    </ListItemIcon>
                    <ListItemText primary="Données globales de la mission (Lieux, véhicule...)" />
                  </ListItem>
                )}
                {entriesToValidate?.map(entryToValidate => (
                  <ListItem
                    dense
                    className={classes.userToValidateEntry}
                    key={entriesToValidate.user?.id}
                  >
                    <ListItemIcon className={classes.userToValidateIcon}>
                      👉
                    </ListItemIcon>
                    <ListItemText
                      primary={`Temps de travail de ${formatPersonName(
                        entryToValidate.user
                      )}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Typography>
            <LoadingButton
              aria-label="Valider"
              variant="contained"
              color="primary"
              size="small"
              className={classes.validationButton}
              onClick={async e => {
                e.stopPropagation();
                entriesToValidate.map(workerEntryToValidate => {
                  missionActions.validateMission(workerEntryToValidate.user.id);
                });
              }}
            >
              Valider les saisies
            </LoadingButton>
          </Box>
        </MissionDetailsSection>
      )}
      {adminValidations(mission)?.length > 0 && (
        <MissionDetailsSection
          key={6}
          title="Historique des Validations gestionnaire"
          className={classes.validationSection}
        >
          <AdminValidationInfo
            adminValidations={adminValidations(mission)}
            className={classes.adminValidation}
          />
        </MissionDetailsSection>
      )}
    </Box>
  );
}
