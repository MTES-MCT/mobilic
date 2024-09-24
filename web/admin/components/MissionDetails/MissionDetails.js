import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Typography from "@mui/material/Typography";
import {
  formatDateTime,
  formatTimeOfDay,
  frenchFormatDateStringOrTimeStamp,
  getStartOfDay,
  textualPrettyFormatDay,
  unixTimestampToDate
} from "common/utils/time";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../../store/store";
import { LoadingButton } from "common/components/LoadingButton";
import { useModals } from "common/utils/modals";
import List from "@mui/material/List";
import { MISSION_QUERY } from "common/utils/apiQueries";
import { formatApiError } from "common/utils/errors";
import { editUserExpenditures } from "common/utils/expenditures";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import {
  missionHasAtLeastOneAdminValidation,
  missionsSelector
} from "../../selectors/missionSelectors";
import { MissionEmployeeCard } from "../MissionEmployeeCard";
import ListItem from "@mui/material/ListItem";
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
import { WarningModificationMission } from "./WarningModificationMission";
import { ACTIVITIES } from "common/utils/activities";
import {
  entryDeleted,
  entryToBeValidatedByAdmin,
  missionToValidationEntries
} from "../../selectors/validationEntriesSelectors";
import { partition } from "lodash/collection";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  ADD_EMPLOYEE_IN_MISSION_PANEL,
  VALIDATE_MISSION_IN_MISSION_PANEL
} from "common/utils/matomoTags";
import { MissionDetailsVehicle } from "./MissionDetailsVehicle";
import { MissionDetailsLocations } from "./MissionDetailsLocations";
import { MissionDetailsObservations } from "./MissionDetailsObservations";
import Notice from "../../../common/Notice";

export function MissionDetails({
  missionId,
  day,
  handleClose,
  setShouldRefreshActivityPanel,
  refreshData
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
  const [missionLoadError, setMissionLoadError] = React.useState(false);

  const [usersToAdd, setUsersToAdd] = React.useState([]);

  const [
    entriesToValidateByAdmin,
    setEntriesToValidateByAdmin
  ] = React.useState([]);
  const [
    entriesToValidateByWorker,
    setEntriesToValidateByWorker
  ] = React.useState([]);
  const [entriesDeleted, setEntriesDeleted] = React.useState([]);
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
    }
    setLoading(false);
  }

  const isMissionDeleted = React.useMemo(() => mission?.isDeleted, [mission]);
  const isMissionHoliday = React.useMemo(() => mission?.isHoliday, [mission]);

  const adminMayOverrideValidation = React.useMemo(
    () =>
      mission &&
      (mission.missionTooOld ||
        mission.missionNotUpdatedForTooLong ||
        missionCreatedByAdmin(mission, adminStore.employments)),
    [mission]
  );

  const globalFieldsEditable = React.useMemo(
    () =>
      !isMissionHoliday &&
      !isMissionDeleted &&
      !missionHasAtLeastOneAdminValidation(mission) &&
      (entriesToValidateByAdmin?.length > 0 || adminMayOverrideValidation),
    [entriesToValidateByAdmin, adminMayOverrideValidation]
  );

  const onValidate = async () => {
    setLoading(true);
    const usersToValidate = entriesToValidateByAdmin.map(
      workerEntryToValidate => workerEntryToValidate.user.id
    );
    await missionActions.validateMission(usersToValidate);
    setLoading(false);
  };

  React.useEffect(() => {
    if (missionId) loadMission();
  }, [missionId]);

  React.useEffect(() => {
    const [deleted, notDeleted] = partition(workerEntries, workerEntry =>
      entryDeleted(workerEntry)
    );
    setEntriesDeleted(deleted);
    const [
      toBeValidatedByAdmin,
      notToBeValidatedByAdmin
    ] = partition(notDeleted, workerEntry =>
      entryToBeValidatedByAdmin(
        workerEntry,
        adminStore.userId,
        adminMayOverrideValidation
      )
    );
    setEntriesToValidateByAdmin(toBeValidatedByAdmin);
    const [validatedByAdmin, toValidateByWorker] = partition(
      notToBeValidatedByAdmin,
      workerEntry => workerEntry.adminValidation
    );
    setEntriesValidatedByAdmin(validatedByAdmin);
    setEntriesToValidateByWorker(toValidateByWorker);
  }, [workerEntries, adminMayOverrideValidation]);

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

  if (loading) return <CircularProgress color="primary" />;
  if (missionLoadError)
    return <Typography color="error">{missionLoadError}</Typography>;

  if (!mission) return null;

  const adminSettings = adminStore.settings;

  const showExpenditures =
    adminSettings.requireExpenditures && !mission.isHoliday;
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
          justifyContent="space-between"
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
              missionPrefix={!isMissionHoliday}
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
          <Typography
            variant="h6"
            component="span"
            className={classes.missionSubTitle}
          >
            Du {textualPrettyFormatDay(mission.startTime || day)}{" "}
            {doesMissionSpanOnMultipleDays &&
            !(mission.isDeleted && !mission.isComplete) ? (
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
      {isMissionDeleted && (
        <Box sx={{ mb: 2 }}>
          <Notice
            type="info"
            description={
              <>
                Cette mission a été supprimée le{" "}
                {frenchFormatDateStringOrTimeStamp(
                  unixTimestampToDate(mission?.deletedAt)
                )}{" "}
                par {mission?.deletedBy}.
              </>
            }
          />
        </Box>
      )}
      {globalFieldsEditable && <WarningModificationMission />}
      {globalFieldsEditable && mission.missionNotUpdatedForTooLong && (
        <Notice
          type="warning"
          description={
            <>
              Vous pouvez modifier et valider cette mission car la dernière
              activité de votre salarié dure depuis plus de{" "}
              {DEFAULT_LAST_ACTIVITY_TOO_LONG / 3600} heures.
            </>
          }
          className={classes.missionTooLongWarning}
        />
      )}
      {!isMissionHoliday && (
        <MissionDetailsVehicle
          mission={mission}
          missionActions={missionActions}
          isEditable={globalFieldsEditable}
          titleProps={{ component: "h2" }}
        />
      )}
      <MissionDetailsLocations
        mission={mission}
        missionActions={missionActions}
        dateTimeFormatter={dateTimeFormatter}
        isEditable={globalFieldsEditable}
        showKilometerReading={showKilometerReading}
        titleProps={{ component: "h2" }}
      />
      <MissionDetailsObservations
        mission={mission}
        missionActions={missionActions}
        titleProps={{ component: "h2" }}
      />
      {showKilometerReading &&
        mission.startLocation &&
        mission.startLocation.kilometerReading &&
        mission.endLocation &&
        mission.endLocation.kilometerReading &&
        mission.endLocation.kilometerReading >=
          mission.startLocation.kilometerReading && (
          <Typography
            variant="h5"
            component="span"
            className={classes.kilometers}
          >
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
          title="Saisie(s) à valider"
          actionButtonLabel="Ajouter un salarié"
          className={classes.validationSection}
          action={
            globalFieldsEditable
              ? () => {
                  trackEvent(ADD_EMPLOYEE_IN_MISSION_PANEL);
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
          titleProps={{ component: "h2" }}
        >
          <List>
            {entriesToValidateByAdmin.map(e => (
              <ListItem key={e.user.id} disableGutters>
                <MissionEmployeeCard
                  className={classes.employeeCard}
                  mission={mission}
                  user={e.user}
                  showExpenditures={showExpenditures}
                  headingComponent="h3"
                  onCreateActivity={
                    entryToBeValidatedByAdmin(
                      e,
                      adminStore.userId,
                      adminMayOverrideValidation
                    ) || !e.activities
                      ? () =>
                          modals.open("activityRevision", {
                            otherActivities: mission.activities,
                            handleSeveralActions: actions =>
                              missionActions.severalActionsActivity({
                                actions,
                                user: e.user
                              }),
                            adminMode: true,
                            allowTransfers,
                            allowSupportActivity,
                            nullableEndTime: false,
                            defaultTime: mission.startTime || day,
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
                            handleSeveralActions: actions =>
                              missionActions.severalActionsActivity({
                                actions,
                                user: e.user
                              }),
                            adminMode: true,
                            allowTransfers,
                            allowSupportActivity,
                            nullableEndTime: false,
                            forcedUser: e.user,
                            displayWarningMessage: false,
                            handleCancelMission: async () => {
                              await missionActions.cancelMission({
                                user: e.user
                              });
                              await refreshData();
                              handleClose();
                            }
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
              <Notice
                type="info"
                description="Il ne vous sera plus possible de modifier les données après
                  validation, y compris les données globales de la mission
                  (Lieux, Véhicules)."
              />
              <LoadingButton
                aria-label="Valider"
                variant="contained"
                color="primary"
                size="small"
                className={classes.validationButton}
                onClick={async e => {
                  e.stopPropagation();
                  trackEvent(VALIDATE_MISSION_IN_MISSION_PANEL);
                  onValidate();
                }}
              >
                Valider les saisies
              </LoadingButton>
            </Box>
          )}
        </MissionDetailsSection>
      )}
      {entriesToValidateByWorker?.length > 0 && (
        <MissionDetailsSection key={6} title="Saisie(s) en cours">
          <Notice
            type="info"
            description="Vous aurez accès à la validation de ces saisies lorsque le salarié
              les aura validées."
          />
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
        <MissionDetailsSection key={7} title="Saisie(s) validée(s)">
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
      {entriesDeleted?.length > 0 && (
        <MissionDetailsSection key={8} title="Saisie(s) supprimée(s)">
          <List>
            {entriesDeleted.map(e => (
              <ListItem key={e.user.id} disableGutters>
                <MissionEmployeeCard
                  className={classes.employeeCard}
                  mission={mission}
                  user={e.user}
                  showExpenditures={showExpenditures}
                  day={day}
                  displayIcon={false}
                  isDeleted={true}
                />
              </ListItem>
            ))}
          </List>
        </MissionDetailsSection>
      )}
    </Box>
  );
}
