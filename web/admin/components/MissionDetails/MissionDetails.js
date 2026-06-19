import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  frenchFormatDateStringOrTimeStamp,
  getStartOfDay,
  unixTimestampToDate,
} from "common/utils/time";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../../store/store";
import { LoadingButton } from "common/components/LoadingButton";
import { useModals } from "common/utils/modals";
import List from "@mui/material/List";
import { formatApiError } from "common/utils/errors";
import { editUserExpenditures } from "common/utils/expenditures";
import CircularProgress from "@mui/material/CircularProgress";
import {
  missionHasAtLeastOneAdminValidation,
  missionsSelector
} from "../../selectors/missionSelectors";
import { MissionEmployeeCard } from "../MissionEmployeeCard";
import ListItem from "@mui/material/ListItem";
import { ADMIN_ACTIONS } from "../../store/reducers/root";
import { useMissionActions } from "../../utils/missionActions";
import { useMissionWithStats } from "../../utils/missionWithStats";
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
import { MissionDetailsVehicleAndLocations } from "./MissionDetailsVehicleAndLocations";
import Notice from "../../../common/Notice";
import { PastMissionNotice } from "./PastMissionNotice";
import { MISSION_QUERY } from "common/utils/apiQueries/missions";
import { MissionDrawerHeader } from "../../drawers/DrawerHeader";
import { MissionDetailsObservations } from "./MissionDetailsObservations";
import { ToValidateTag, WaitingTag, ValidatedTag, DeletedTag } from "../../drawers/Tags";

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

  const [overrideValidationJustification, setOverrideValidationJustification] =
    React.useState("");

  const [entriesToValidateByAdmin, setEntriesToValidateByAdmin] =
    React.useState([]);
  const [entriesToValidateByWorker, setEntriesToValidateByWorker] =
    React.useState([]);
  const [entriesDeleted, setEntriesDeleted] = React.useState([]);
  const [entriesValidatedByAdmin, setEntriesValidatedByAdmin] = React.useState(
    []
  );
  const [userIdsWithEntries, setUserIdsWithEntries] = React.useState(false);

  const overrideValidation = () => {
    modals.open("overrideValidation", {
      updateJustification: setOverrideValidationJustification
    });
  };

  async function loadMission() {
    const alreadyFetchedMission = missionsSelector(adminStore)?.find(
      (m) => m.id === missionId
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
      (overrideValidationJustification ||
        (!missionHasAtLeastOneAdminValidation(mission) &&
          (entriesToValidateByAdmin?.length > 0 ||
            adminMayOverrideValidation))),
    [
      entriesToValidateByAdmin,
      adminMayOverrideValidation,
      overrideValidationJustification
    ]
  );

  const onValidate = async () => {
    setLoading(true);
    const usersToValidate = entriesToValidateByAdmin.map(
      (workerEntryToValidate) => workerEntryToValidate.user.id
    );
    await missionActions.validateMission(
      usersToValidate,
      overrideValidationJustification
    );
    await refreshData();
    setOverrideValidationJustification("");
    setLoading(false);
  };

  React.useEffect(() => {
    if (missionId) loadMission();
  }, [missionId]);

  React.useEffect(() => {
    const [deleted, notDeleted] = partition(workerEntries, (workerEntry) =>
      entryDeleted(workerEntry)
    );
    setEntriesDeleted(deleted);
    const [toBeValidatedByAdmin, notToBeValidatedByAdmin] = partition(
      notDeleted,
      (workerEntry) =>
        entryToBeValidatedByAdmin(
          workerEntry,
          adminStore.userId,
          adminMayOverrideValidation,
          overrideValidationJustification
        )
    );
    setEntriesToValidateByAdmin(toBeValidatedByAdmin);
    const [validatedByAdmin, toValidateByWorker] = partition(
      notToBeValidatedByAdmin,
      (workerEntry) => workerEntry.adminValidation
    );
    setEntriesValidatedByAdmin(validatedByAdmin);
    setEntriesToValidateByWorker(toValidateByWorker);
  }, [
    workerEntries,
    adminMayOverrideValidation,
    overrideValidationJustification
  ]);

  React.useEffect(() => {
    if (mission) {
      const entries = missionToValidationEntries(mission);
      entries.sort((e1, e2) => e1.user.id - e2.user.id);
      const userIdsInMission = entries.map((e) => e.user.id);
      usersToAdd.forEach((user) => {
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

  if (loading) {
    return <CircularProgress color="primary" />;
  }
  
  if (missionLoadError)
    return <Typography color="error">{missionLoadError}</Typography>;

  if (!mission) return null;

  const adminSettings = adminStore.settings;

  const showExpenditures =
    adminSettings.requireExpenditures && !mission.isHoliday;
  const showKilometerReading = adminSettings.requireKilometerData;
  const allowTransfers = adminSettings.allowTransfers;
  const allowOtherTask = adminSettings.allowOtherTask;
  const otherTaskLabel = adminSettings.otherTaskLabel;
  const allowSupportActivity = adminSettings.requireSupportActivity;
  const editableMissionName = adminSettings.requireMissionName;

  const hasMultipleWorkers = workerEntries.length > 1;

  const doesMissionSpanOnMultipleDays =
    mission.startTime &&
    mission.endTimeOrNow &&
    getStartOfDay(mission.startTime) !==
      getStartOfDay(mission.endTimeOrNow - 1);
  return (
    <Box>
      <MissionDrawerHeader
        mission={mission}
        onClose={handleClose}
        onEditMissionName={
          globalFieldsEditable && editableMissionName
            ? (newName) => missionActions.changeName(newName)
            : null
        }
        noEmployeeValidation={entriesToValidateByWorker?.length > 0}
        toBeValidatedByAdmin={entriesToValidateByAdmin?.length > 0}
        doesMissionSpanOnMultipleDays={doesMissionSpanOnMultipleDays}
        day={day}
      />
      <Box px={4} py={5}>
        {isMissionDeleted && (
          <Notice
            type="info"
            description={
              <>
                Cette mission a été supprimée le{" "}
                {frenchFormatDateStringOrTimeStamp(
                  unixTimestampToDate(mission?.deletedAt),
                )}{" "}
                par {mission?.deletedBy}.
              </>
            }
            sx={{ mb: 2 }}
          />
        )}
        {mission.pastRegistrationJustification ? (
          <PastMissionNotice
            missionName={mission.name}
            justification={mission.pastRegistrationJustification}
            submitter={mission.submitter}
            sx={{ mb: 2 }}
          />
        ) : (
          globalFieldsEditable && <WarningModificationMission />
        )}
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
        <MissionDetailsVehicleAndLocations
          mission={mission}
          missionActions={missionActions}
          isEditable={globalFieldsEditable}
          showKilometerReading={showKilometerReading}
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
              className={classes.kilometers}
            >
              Distance parcourue :{" "}
              <span className={classes.kilometersValue}>
                {mission.endLocation.kilometerReading -
                  mission.startLocation.kilometerReading}{" "}
                km
              </span>
            </Typography>
          )}
        <MissionDetailsObservations
          mission={mission}
          missionActions={missionActions}
          titleProps={{ component: "h2" }}
          addEmployeeAction={
            globalFieldsEditable
              ? () => {
                  trackEvent(ADD_EMPLOYEE_IN_MISSION_PANEL);
                  modals.open("selectEmployee", {
                    users: adminStore.users.filter(
                      (u) =>
                        u.companyId === mission.companyId &&
                        !userIdsWithEntries.includes(u.id) &&
                        !usersToAdd.map((u2) => u2.id).includes(u.id)
                    ),
                    handleSelect: (user) =>
                      setUsersToAdd((users) => [
                        ...users.filter((u) => u.id !== user.id),
                        user
                      ])
                  });
                }
              : null
          }
        />
        <List className={classes.employeeList}>
          {entriesToValidateByAdmin.map((e) => (
            <ListItem key={`admin-${e.user.id}`} disableGutters className={classes.employeeListItem}>
              <MissionEmployeeCard
                className={classes.employeeCard}
                mission={mission}
                user={e.user}
                showUserName={hasMultipleWorkers}
                showExpenditures={showExpenditures}
                headingComponent="h3"
                statusTag={hasMultipleWorkers ? <ToValidateTag /> : null}
                onCreateActivity={
                  entryToBeValidatedByAdmin(
                    e,
                    adminStore.userId,
                    adminMayOverrideValidation,
                    overrideValidationJustification
                  ) || !e.activities
                    ? () =>
                        modals.open("activityRevision", {
                          otherActivities: mission.activities,
                          handleSeveralActions: (actions) =>
                            missionActions.severalActionsActivity({
                              actions,
                              user: e.user
                            }),
                          adminMode: true,
                          allowTransfers,
                          allowSupportActivity,
                          allowOtherTask,
                          otherTaskLabel,
                          nullableEndTime: false,
                          defaultTime: mission.startTime || day,
                          forcedUser: e.user,
                          displayWarningMessage: false,
                        })
                    : null
                }
                onEditActivity={
                  entryToBeValidatedByAdmin(
                    e,
                    adminStore.userId,
                    adminMayOverrideValidation,
                    overrideValidationJustification
                  ) || !e.activities
                    ? async (entry) =>
                        modals.open("activityRevision", {
                          event: entry,
                          otherActivities:
                            entry.type === ACTIVITIES.break.name
                              ? mission.activities
                              : mission.activities.filter(
                                  (a) => a.startTime !== entry.startTime
                                ),
                          handleSeveralActions: (actions) =>
                            missionActions.severalActionsActivity({
                              actions,
                              user: e.user
                            }),
                          adminMode: true,
                          allowTransfers,
                          allowSupportActivity,
                          allowOtherTask,
                          otherTaskLabel,
                          nullableEndTime: false,
                          forcedUser: e.user,
                          displayWarningMessage: false,
                          handleCancelMission: async () => {
                            await missionActions.cancelMission({
                              user: e.user
                            });
                            await refreshData();
                            handleClose();
                          },
                        })
                    : null
                }
                onEditExpenditures={
                  entryToBeValidatedByAdmin(
                    e,
                    adminStore.userId,
                    adminMayOverrideValidation,
                    overrideValidationJustification
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
                  setUsersToAdd((users) =>
                    users.filter((u) => u.id !== e.user.id)
                  )
                }
                alwaysOpen
                day={day}
              />
            </ListItem>
          ))}
          {entriesToValidateByAdmin?.length > 0 && (
            <Box textAlign="center" mt={4}>
              <Notice
                type="info"
                description="Il ne vous sera plus possible de modifier les données après
                validation, y compris les données globales de la mission
                (Lieux, Véhicules)."
              />
              <LoadingButton
                size="large"
                className={classes.validationButton}
                onClick={async (e) => {
                  e.stopPropagation();
                  trackEvent(VALIDATE_MISSION_IN_MISSION_PANEL);
                  onValidate();
                }}
              >
                Valider les saisies
              </LoadingButton>
            </Box>
          )}
          {entriesToValidateByWorker.length > 0 && (
            <Notice
              type="info"
              sx={{ mt: 5 }}
              description="Vous aurez accès à la validation de ces saisies lorsque le salarié
              les aura validées."
            />
          )}
          {entriesToValidateByWorker.map((e) => (
            <ListItem key={`worker-${e.user.id}`} disableGutters className={classes.employeeListItem}>
              <MissionEmployeeCard
                className={classes.employeeCard}
                mission={mission}
                user={e.user}
                showUserName={hasMultipleWorkers}
                showExpenditures={showExpenditures}
                statusTag={hasMultipleWorkers ? <WaitingTag /> : null}
                alwaysOpen
                day={day}
              />
            </ListItem>
          ))}
          {entriesValidatedByAdmin.map((e) => (
            <ListItem key={`validated-${e.user.id}`} disableGutters className={classes.employeeListItem}>
              <MissionEmployeeCard
                className={classes.employeeCard}
                mission={mission}
                user={e.user}
                showUserName={hasMultipleWorkers}
                showExpenditures={showExpenditures}
                statusTag={hasMultipleWorkers ? <ValidatedTag /> : null}
                missionActions={missionActions}
                alwaysOpen
                simplified
                day={day}
                overrideValidation={overrideValidation}
              />
            </ListItem>
          ))}
          {entriesDeleted.map((e) => (
            <ListItem key={`deleted-${e.user.id}`} disableGutters className={classes.employeeListItem}>
              <MissionEmployeeCard
                className={classes.employeeCard}
                mission={mission}
                user={e.user}
                showUserName={hasMultipleWorkers}
                showExpenditures={showExpenditures}
                statusTag={hasMultipleWorkers ? <DeletedTag /> : null}
                missionActions={missionActions}
                alwaysOpen
                day={day}
                isDeleted={true}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
}
