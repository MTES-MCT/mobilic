import React from "react";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../../store/store";
import { formatPersonName } from "common/utils/coworkers";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import {
  DAY,
  frenchFormatDateStringOrTimeStamp,
  isoFormatLocalDate,
  now
} from "common/utils/time";
import { ADMIN_ACTIONS } from "../../store/reducers/root";
import { EMPLOYMENT_ROLE } from "common/utils/employments";
import { NO_TEAMS_LABEL, NO_TEAM_ID } from "../../utils/teams";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { readCookie, setCookie } from "common/utils/cookie";
import { useEmployeeProgress } from "../../hooks/useEmployeeProgress";
import { useAutoUpdateNbWorkers } from "../../hooks/useAutoUpdateNbWorkers";
import { useEnsureEmployments } from "../../hooks/useEnsureEmployments";
import { useEnsureTeams } from "../../hooks/useEnsureTeams";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import {
  INVITE_NEW_EMPLOYEE_SUBMIT,
  INVITE_EMAIL_LIST_CLICK,
  INVITE_MISSING_EMPLOYEES_CLICK,
  INVITE_NEW_EMPLOYEE_CLICK,
  INACTIVE_EMPLOYEES_BANNER_VIEW,
  INACTIVE_EMPLOYEES_BANNER_CLICK
} from "common/utils/matomoTags";
import {
  BATCH_CREATE_WORKER_EMPLOYMENTS_MUTATION,
  CANCEL_EMPLOYMENT_MUTATION,
  CREATE_EMPLOYMENT_MUTATION,
  SEND_INVITATIONS_REMINDERS
} from "common/utils/apiQueries/employments";
import {
  getPendingEmploymentColumns,
  getValidEmploymentColumns
} from "./employmentColumns";

const STATUS_BADGE = {
  ACTIVE: 0,
  INACTIVE: 1,
  DETACHED: 2
};

const isLessThanTwelveHoursAgo = (ts) => {
  const nbSecondsElapsed = now() - ts;
  return nbSecondsElapsed <= DAY / 2;
};

export function useEmployeesData(company) {
  const api = useApi();
  const { trackEvent } = useMatomo();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const [teams, setTeams] = React.useState([]);
  const [hasClosedInviteModal, setHasClosedInviteModal] = React.useState(false);

  const companyId = React.useMemo(() => company?.id || null, [company]);

  useEnsureEmployments();
  useEnsureTeams();

  React.useEffect(() => {
    if (teams.length > 0) {
      return;
    }
    if (adminStore?.teams?.length > 0) {
      setTeams([
        { name: NO_TEAMS_LABEL, id: NO_TEAM_ID, rankName: "zzz" },
        ...adminStore.teams.map((team) => ({ ...team, rankName: team.name }))
      ]);
    } else {
      setTeams([]);
    }
  }, [adminStore.teams]);

  const selectedTeamIds = React.useMemo(() => {
    if (!teams) {
      return [];
    }
    return teams.filter((team) => team.selected).map((team) => team.id);
  }, [teams]);

  const setForceUpdate = React.useState({
    value: false
  })[1];

  const [wantsToAddEmployment, setWantsToAddEmployment] = React.useState(false);
  const [openPendingTable, setOpenPendingTable] = React.useState(true);

  const pendingEmploymentsTableRef = React.useRef();
  const validEmploymentsTableRef = React.useRef();

  const updateValidListScrollPosition = () =>
    setTimeout(validEmploymentsTableRef?.current?.updateScrollPosition, 0);

  const handleTogglePendingTable = () => {
    setOpenPendingTable((value) => !value);
    setTimeout(validEmploymentsTableRef?.current?.updateScrollPosition, 0);
  };

  const handlePendingRowAdd = async ({ idOrEmail, hasAdminRights, teamId }) => {
    const payload = {
      hasAdminRights: hasAdminRights === EMPLOYMENT_ROLE.admin,
      companyId,
      ...(teamId !== NO_TEAM_ID && { teamId })
    };
    if (/^\d+$/.test(idOrEmail)) {
      payload.userId = parseInt(idOrEmail);
    } else {
      payload.mail = idOrEmail.toLowerCase();
    }
    try {
      const apiResponse = await api.graphQlMutate(
        CREATE_EMPLOYMENT_MUTATION,
        payload
      );
      trackEvent(INVITE_NEW_EMPLOYEE_SUBMIT);
      adminStore.dispatch({
        type: ADMIN_ACTIONS.create,
        payload: {
          items: [
            {
              ...apiResponse.data.employments.createEmployment,
              companyId
            }
          ],
          entity: "employments"
        }
      });
    } catch (err) {
      alerts.error(formatApiError(err), idOrEmail, 6000);
    }
  };

  async function sendInvitationsReminders(employmentIds) {
    try {
      const res = await api.graphQlMutate(SEND_INVITATIONS_REMINDERS, {
        employmentIds
      });
      const sentToEmploymentIds =
        res.data.employments.sendInvitationsReminders.sentToEmploymentIds;
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.updateEmploymentsLatestInvitateEmailTime,
        payload: {
          employmentIds: sentToEmploymentIds
        }
      });
      alerts.success(
        `${sentToEmploymentIds.length} relance(s) envoyée(s)`,
        employmentIds[0],
        6000
      );
    } catch {
      alerts.error("Une erreur est survenue", {}, 6000);
    }
  }

  const cancelEmployment = async (employment) => {
    try {
      await api.graphQlMutate(CANCEL_EMPLOYMENT_MUTATION, {
        employmentId: employment.id
      });
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.delete,
        payload: { id: employment.id, entity: "employments" }
      });
      alerts.success(
        `Le rattachement de ${formatPersonName(employment)} a été annulé`,
        "cancel-employment",
        6000
      );
    } catch (err) {
      alerts.error(formatApiError(err), "cancel-employment", 6000);
    }
  };

  const pendingEmploymentColumns = getPendingEmploymentColumns({
    teams: adminStore?.teams
  });

  const companyEmployments = React.useMemo(
    () => adminStore.employments.filter((e) => e.companyId === companyId),
    [adminStore.employments, companyId]
  );

  const pendingEmployments = React.useMemo(
    () =>
      companyEmployments
        .filter((e) => !e.isAcknowledged)
        .map((e) => ({
          pending: true,
          idOrEmail: e.email || e.user?.id,
          hasAdminRights: e.hasAdminRights,
          creationDate: e.startDate,
          latestInviteEmailTime: e.latestInviteEmailTime,
          latestInviteEmailDateString: frenchFormatDateStringOrTimeStamp(
            e.latestInviteEmailTime
              ? e.latestInviteEmailTime * 1000
              : e.startDate
          ),
          id: e.id,
          teamId: e.teamId,
          employmentId: e.id,
          userId: e.user?.id,
          companyId: e.company?.id,
          remindButton: (
            <Button
              disabled={
                e.latestInviteEmailTime &&
                isLessThanTwelveHoursAgo(e.latestInviteEmailTime)
              }
              priority="tertiary no outline"
              size="small"
              iconPosition="left"
              iconId="fr-icon-arrow-go-back-fill"
              onClick={async () => {
                await alerts.withApiErrorHandling(async () =>
                  sendInvitationsReminders([e.id])
                );
              }}
            >
              Relancer
            </Button>
          ),
          cancelButton: (
            <Button
              priority="tertiary no outline"
              size="small"
              iconPosition="left"
              iconId="fr-icon-close-line"
              onClick={() =>
                modals.open("confirmation", {
                  textButtons: true,
                  title: "Confirmer l'annulation du rattachement",
                  handleConfirm: async () =>
                    alerts.withApiErrorHandling(
                      async () => cancelEmployment(e),
                      "cancel-employment"
                    )
                })
              }
            >
              Annuler
            </Button>
          )
        })),
    [companyEmployments]
  );

  const disableRemindAllPendingInvitations = React.useMemo(
    () =>
      pendingEmployments.filter(
        (e) =>
          e.latestInviteEmailTime &&
          isLessThanTwelveHoursAgo(e.latestInviteEmailTime)
      ).length === pendingEmployments.length,
    [pendingEmployments]
  );

  const hasMadeInvitations = React.useMemo(
    () =>
      companyEmployments.filter((e) => e.user?.id !== adminStore.userId)
        .length > 0,
    [adminStore.userId, companyEmployments]
  );

  const isLoaded = React.useMemo(
    () => companyEmployments && companyEmployments.length > 0 && !!companyId,
    [companyEmployments, companyId]
  );

  const today = isoFormatLocalDate(new Date());

  const validEmployments = React.useMemo(
    () =>
      companyEmployments
        .filter((e) => {
          return (
            selectedTeamIds.length === 0 ||
            selectedTeamIds.includes(e.teamId) ||
            (selectedTeamIds.includes(NO_TEAM_ID) && !e.teamId)
          );
        })
        .filter((e) => e.isAcknowledged)
        .map((e) => {
          const isDetached = e.endDate ? e.endDate <= today : false;
          const isInactive = !isDetached && e.isInactive;
          const statusBadge = isDetached
            ? STATUS_BADGE.DETACHED
            : isInactive
              ? STATUS_BADGE.INACTIVE
              : STATUS_BADGE.ACTIVE;
          return {
            pending: false,
            id: e.user.id,
            email: e.user.email,
            employmentId: e.id,
            lastName: e.user.lastName,
            firstName: e.user.firstName,
            name: formatPersonName(e.user),
            startDate: e.startDate,
            endDate: e.endDate,
            active: !e.endDate || e.endDate > today,
            hasAdminRights: e.hasAdminRights ? 1 : 0,
            teamId: e.teamId,
            userId: e.user.id,
            companyId: e.company.id,
            business: e.business,
            lastActiveAt: e.lastActiveAt,
            status: e.status,
            isDetached,
            isInactive,
            statusBadge
          };
        }),
    [companyEmployments, selectedTeamIds]
  );

  const areThereEmploymentsWithoutBusinessType = React.useMemo(
    () => validEmployments.filter((e) => !e.business).length > 0,
    [validEmployments]
  );

  const activeValidEmployments = React.useMemo(
    () => validEmployments.filter((e) => e.active),
    [validEmployments]
  );

  const inactiveEmployees = React.useMemo(
    () => activeValidEmployments.filter((e) => e.isInactive),
    [activeValidEmployments]
  );

  const INACTIVE_BANNER_COOKIE = "dismissInactiveBanner";
  const [isBannerDismissed, setIsBannerDismissed] = React.useState(() => {
    const dismissedAt = readCookie(INACTIVE_BANNER_COOKIE);
    if (!dismissedAt) return false;
    const dismissedTime = parseInt(dismissedAt, 10);
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Date.now() - dismissedTime < oneDayMs;
  });

  const handleDismissBanner = () => {
    setCookie(INACTIVE_BANNER_COOKIE, Date.now().toString(), 1);
    setIsBannerDismissed(true);
  };

  const shouldShowInactiveBanner =
    inactiveEmployees.length >= 3 && !isBannerDismissed;

  const hasTrackedBannerView = React.useRef(false);

  React.useEffect(() => {
    if (shouldShowInactiveBanner && !hasTrackedBannerView.current) {
      trackEvent(INACTIVE_EMPLOYEES_BANNER_VIEW(inactiveEmployees.length));
      hasTrackedBannerView.current = true;
    }
  }, [shouldShowInactiveBanner, inactiveEmployees.length]);

  const handleBatchTerminateSuccess = async (terminatedEmployments) => {
    for (const { employmentId, endDate } of terminatedEmployments) {
      const employment = companyEmployments.find((e) => e.id === employmentId);
      if (employment) {
        await adminStore.dispatch({
          type: ADMIN_ACTIONS.update,
          payload: {
            id: employmentId,
            entity: "employments",
            update: {
              ...employment,
              endDate: endDate || isoFormatLocalDate(new Date()),
              companyId
            }
          }
        });
      }
    }
  };

  const handleReattachSuccess = async (newEmployment, oldEmploymentId) => {
    if (oldEmploymentId && oldEmploymentId !== newEmployment.id) {
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.delete,
        payload: { id: oldEmploymentId, entity: "employments" }
      });
    }
    await adminStore.dispatch({
      type: ADMIN_ACTIONS.create,
      payload: {
        items: [{ ...newEmployment, companyId }],
        entity: "employments"
      }
    });
  };

  const handleOpenBatchTerminateModal = () => {
    trackEvent(INACTIVE_EMPLOYEES_BANNER_CLICK);
    modals.open("terminateEmployment", {
      inactiveEmployees,
      onSuccess: handleBatchTerminateSuccess
    });
  };

  const employeeProgressData = useEmployeeProgress(
    company,
    activeValidEmployments
  );
  useAutoUpdateNbWorkers(company, activeValidEmployments, adminStore);

  const isAddingEmployment =
    pendingEmploymentsTableRef.current &&
    pendingEmploymentsTableRef.current.isAddingRow &&
    pendingEmploymentsTableRef.current.isAddingRow();

  const canDisplayPendingEmployments =
    isAddingEmployment || pendingEmployments.length > 0 || wantsToAddEmployment;

  // Effect to trigger newRow when wanting to add employment and ref becomes available
  React.useEffect(() => {
    if (wantsToAddEmployment && pendingEmploymentsTableRef.current) {
      pendingEmploymentsTableRef.current.newRow({
        hasAdminRights: EMPLOYMENT_ROLE.employee,
        teamId: NO_TEAM_ID
      });
    }
  }, [wantsToAddEmployment, canDisplayPendingEmployments]);

  // Reset wantsToAddEmployment when isAddingEmployment becomes true
  React.useEffect(() => {
    if (isAddingEmployment && wantsToAddEmployment) {
      setWantsToAddEmployment(false);
    }
  }, [isAddingEmployment, wantsToAddEmployment]);

  const validEmploymentColumns = getValidEmploymentColumns({
    adminStore,
    companyId,
    modals,
    handleReattachSuccess,
    handleBatchTerminateSuccess
  });

  const batchInvite = async ({ emails, userIds }) => {
    await alerts.withApiErrorHandling(async () => {
      const variables = { companyId };
      if (emails && emails.length > 0) {
        variables.mails = emails;
      }
      if (userIds && userIds.length > 0) {
        variables.userIds = userIds;
      }
      const employmentsResponse = await api.graphQlMutate(
        BATCH_CREATE_WORKER_EMPLOYMENTS_MUTATION,
        variables
      );
      const employments =
        employmentsResponse.data.employments.batchCreateWorkerEmployments;
      adminStore.dispatch({
        type: ADMIN_ACTIONS.create,
        payload: {
          items: employments.map((e) => ({ ...e, companyId })),
          entity: "employments"
        }
      });
      const totalRequested =
        (emails ? emails.length : 0) + (userIds ? userIds.length : 0);
      if (employments.length < totalRequested) {
        alerts.warning(
          `${employments.length} invitation(s) envoyée(s) sur ${totalRequested}. Vérifiez les adresses email et identifiants saisis.`,
          "batch-invite-warning",
          6000
        );
      } else {
        alerts.success(
          `${employments.length} invitation(s) envoyée(s) !`,
          "batch-invite-success",
          6000
        );
      }
      setTimeout(validEmploymentsTableRef.current.updateScrollPosition, 0);
    });
  };

  const handleBatchInvite = (employeeCount = 0) => {
    if (employeeCount > 0) {
      trackEvent(INVITE_MISSING_EMPLOYEES_CLICK(employeeCount));
    } else {
      trackEvent(INVITE_EMAIL_LIST_CLICK);
    }
    modals.open("batchInvite", {
      handleSubmit: batchInvite
    });
  };

  const handleSingleInvite = () => {
    trackEvent(INVITE_NEW_EMPLOYEE_CLICK);
    setWantsToAddEmployment(true);
    setOpenPendingTable(true);
  };

  const dissmissedBatchInviteCompanyIds = React.useMemo(() => {
    setHasClosedInviteModal(false);
    const cookie = readCookie("dismissBatchInvite");
    if (!cookie) {
      return [];
    }
    return JSON.parse(cookie);
  }, [companyId]);

  const handleCloseBatchInviteModal = () => {
    setCookie(
      "dismissBatchInvite",
      JSON.stringify([...dissmissedBatchInviteCompanyIds, companyId])
    );
    setHasClosedInviteModal(true);
  };

  return {
    companyId,
    teams,
    setTeams,
    hasClosedInviteModal,
    isLoaded,
    hasMadeInvitations,
    dissmissedBatchInviteCompanyIds,
    batchInvite,
    handleCloseBatchInviteModal,
    employeeProgressData,
    handleBatchInvite,
    handleSingleInvite,
    canDisplayPendingEmployments,
    disableRemindAllPendingInvitations,
    sendInvitationsReminders,
    pendingEmployments,
    isLessThanTwelveHoursAgo,
    pendingEmploymentColumns,
    updateValidListScrollPosition,
    setForceUpdate,
    pendingEmploymentsTableRef,
    openPendingTable,
    handleTogglePendingTable,
    handlePendingRowAdd,
    areThereEmploymentsWithoutBusinessType,
    shouldShowInactiveBanner,
    handleDismissBanner,
    inactiveEmployees,
    handleOpenBatchTerminateModal,
    validEmploymentColumns,
    validEmployments,
    validEmploymentsTableRef
  };
}
