import React from "react";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import {
  DAY,
  frenchFormatDateStringOrTimeStamp,
  isoFormatLocalDate,
  now
} from "common/utils/time";
import { formatLastActiveDate } from "common/utils/employeeStatus";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { EMPLOYMENT_ROLE } from "common/utils/employments";
import { TeamFilter } from "../components/TeamFilter";
import { NO_TEAMS_LABEL, NO_TEAM_ID } from "../utils/teams";
import { BusinessDropdown } from "../components/BusinessDropdown";
import { AdminRightsDropdown } from "../components/AdminRightsDropdown";
import { TeamDropdown } from "../components/TeamDropdown";
import Stack from "@mui/material/Stack";
import Notice from "../../common/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { readCookie, setCookie } from "common/utils/cookie";
import BatchInviteModal from "../modals/BatchInviteModal";
import { EmployeeProgressBar } from "../components/EmployeeProgressBar";
import { useEmployeeProgress } from "../hooks/useEmployeeProgress";
import { useAutoUpdateNbWorkers } from "../hooks/useAutoUpdateNbWorkers";
import { InviteButtons } from "../components/InviteButtons";
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
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import { Badge } from "@codegouvfr/react-dsfr/Badge";

const STATUS_BADGE = {
  ACTIVE: 0,
  INACTIVE: 1,
  DETACHED: 2
};

const useStyles = makeStyles((theme) => ({
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  augmentedTable: {
    "& .ReactVirtualized__Table__headerRow": {
      backgroundColor: fr.colors.decisions.background.contrastRaised.grey.default,
      borderTop: "none",
      borderBottom: `2px solid ${fr.colors.decisions.border.plain.grey.default}`
    },
    "& .ReactVirtualized__Table__row": {
      borderBottom: `1px solid ${fr.colors.decisions.border.default.grey.default}`
    },
    "& select": {
      borderBottom: "none"
    },
    "& .fr-select-group": {
      marginBottom: 0
    },
    "& .fr-select": {
      boxShadow: "none",
      textOverflow: "ellipsis",
      overflow: "hidden",
      whiteSpace: "nowrap"
    }
  },
  terminatedEmployment: {
    color: theme.palette.text.disabled
  },
  hideButton: {
    marginLeft: theme.spacing(2)
  },
  badgeDetache: {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
    color: fr.colors.decisions.text.mention.grey.default,
    cursor: "default"
  },
  badgeCursor: {
    cursor: "default"
  }
}));

const isUserOnlyAdminOfTeams = (teams, userId) => {
  return teams
    .filter(
      (team) =>
        team.adminUsers?.length === 1 && team.adminUsers[0].id === userId
    )
    .map((team) => team.name);
};

const isLessThanTwelveHoursAgo = (ts) => {
  const nbSecondsElapsed = now() - ts;
  return nbSecondsElapsed <= DAY / 2;
};

export function Employees({ company, containerRef }) {
  const api = useApi();
  const { trackEvent } = useMatomo();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const [teams, setTeams] = React.useState([]);
  const [hasClosedInviteModal, setHasClosedInviteModal] = React.useState(false);

  const companyId = React.useMemo(() => company?.id || null, [company]);

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

  const [hidePendingEmployments, setHidePendingEmployments] =
    React.useState(true);
  const [wantsToAddEmployment, setWantsToAddEmployment] = React.useState(false);

  const classes = useStyles();

  const pendingEmploymentsTableRef = React.useRef();
  const validEmploymentsTableRef = React.useRef();

  const updateValidListScrollPosition = () =>
    setTimeout(validEmploymentsTableRef?.current?.updateScrollPosition, 0);

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

  const formatTeam = (teamId) =>
    adminStore?.teams?.find((team) => team.id === teamId)?.name;

  const pendingEmploymentColumns = [
    {
      label: "Identifiant ou email",
      name: "idOrEmail",
      create: true,
      sortable: true,
      minWidth: 260,
      baseWidth: 300,
      overflowTooltip: true,
      align: "left"
    },
    {
      label: "Accès gestionnaire",
      name: "hasAdminRights",
      create: true,
      minWidth: 120,
      baseWidth: 120,
      align: "left",
      required: true,
      format: (hasAdminRights) => (hasAdminRights ? "Oui" : "Non"),
      renderEditMode: (type, entry, setType) => (
        <TextField
          required
          fullWidth
          select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem key={0} value={EMPLOYMENT_ROLE.admin}>
            Oui
          </MenuItem>
          <MenuItem key={1} value={EMPLOYMENT_ROLE.employee}>
            Non
          </MenuItem>
        </TextField>
      )
    },
    {
      label: "Invité le",
      format: (dateString) =>
        dateString ? frenchFormatDateStringOrTimeStamp(dateString) : "",
      sortable: true,
      name: "creationDate",
      minWidth: 120,
      baseWidth: 140,
      align: "center"
    },
    {
      label: "Relancé le",
      name: "latestInviteEmailDateString",
      minWidth: 120,
      baseWidth: 140,
      align: "center"
    }
  ];

  if (adminStore?.teams?.length > 0) {
    pendingEmploymentColumns.push({
      label: "Groupe d'affectation",
      name: "teamId",
      create: true,
      minWidth: 160,
      baseWidth: 160,
      align: "left",
      required: true,
      format: formatTeam,
      renderEditMode: (type, entry, setType) => (
        <TextField
          fullWidth
          select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem key={NO_TEAM_ID} value={NO_TEAM_ID}>
            {"-"}
          </MenuItem>
          {adminStore.teams.map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </TextField>
      )
    });
  }

  pendingEmploymentColumns.push({
    label: "",
    name: "remindButton",
    minWidth: 140,
    baseWidth: 140,
    format: (remindButton) => remindButton
  });

  pendingEmploymentColumns.push({
    label: "",
    name: "cancelButton",
    minWidth: 120,
    baseWidth: 120,
    format: (cancelButton) => cancelButton
  });

  const EmployeeStatusBadge = ({ isDetached, isInactive, lastActiveAt, endDate }) => {
    if (isDetached) {
      return (
        <Tooltip title={`Détaché depuis le ${frenchFormatDateStringOrTimeStamp(endDate)}`}>
          <Badge noIcon small className={classes.badgeDetache}>
            {"détaché".toUpperCase()}
          </Badge>
        </Tooltip>
      );
    }
    if (isInactive) {
      return (
        <Tooltip title={`Inactif depuis le ${formatLastActiveDate(lastActiveAt)}. Pensez à détacher ce salarié.`}>
          <Badge severity="warning" noIcon small className={classes.badgeCursor}>
            {"inactif".toUpperCase()}
          </Badge>
        </Tooltip>
      );
    }
    return null;
  };

  const validEmploymentColumns = [
    {
      label: "Salarié",
      name: "lastName",
      align: "left",
      sortable: true,
      alwaysShowSortIcon: true,
      minWidth: 180,
      overflowTooltip: true,
      format: (lastName, entry) => `${lastName} ${entry.firstName}`
    },
    {
      label: "",
      name: "statusBadge",
      align: "left",
      sortable: true,
      propertyForSorting: "statusBadge",
      minWidth: 90,
      baseWidth: 90,
      format: (_, entry) => (
        <EmployeeStatusBadge
          isDetached={entry.isDetached}
          isInactive={entry.isInactive}
          lastActiveAt={entry.lastActiveAt}
          endDate={entry.endDate}
        />
      )
    },
    {
      label: "Email",
      name: "email",
      align: "left",
      sortable: true,
      minWidth: 280,
      overflowTooltip: true
    },
    {
      label: (<>Début<br />rattachement</>),
      name: "startDate",
      align: "left",
      format: (startDate) => frenchFormatDateStringOrTimeStamp(startDate),
      sortable: true,
      minWidth: 90,
      baseWidth: 135
    },
    {
      label: (<>Accès<br />gestionnaire</>),
      name: "hasAdminRights",
      format: (hasAdminRights, entry) => (
        <AdminRightsDropdown
          employmentId={entry.employmentId}
          companyId={companyId}
          hasAdminRights={!!hasAdminRights}
          disabled={entry.id === adminStore.userId}
          isDetached={entry.isDetached}
        />
      ),
      align: "left",
      sortable: true,
      minWidth: 140,
      baseWidth: 135
    }
  ];

  if (adminStore?.teams?.length > 0) {
    validEmploymentColumns.push({
      label: (<>Groupe<br />d'affectation</>),
      name: "teamId",
      align: "left",
      format: (teamId, entry) => (
        <TeamDropdown
          employmentId={entry.employmentId}
          companyId={companyId}
          teamId={teamId}
          disabled={entry.isDetached}
        />
      ),
      minWidth: 140,
      baseWidth: 135
    });
  }

  validEmploymentColumns.push({
    label: "Type d'activité",
    name: "business",
    align: "left",
    format: (business, { employmentId, isDetached }) => (
      <BusinessDropdown
        business={business}
        companyId={companyId}
        employmentId={employmentId}
        disabled={isDetached}
      />
    ),
    minWidth: 180
  });

  validEmploymentColumns.push({
    label: "Identifiant",
    name: "id",
    align: "left",
    minWidth: 120,
    baseWidth: 120
  });

  validEmploymentColumns.push({
    label: "",
    name: "action",
    align: "left",
    minWidth: 120,
    baseWidth: 120,
    format: (_, entry) =>
      entry.isDetached ? (
        <Button
          priority="tertiary no outline"
          size="small"
          iconPosition="left"
          iconId="fr-icon-arrow-go-forward-line"
          onClick={() =>
            modals.open("reattachEmployment", {
              employee: entry,
              onSuccess: (newEmployment) =>
                handleReattachSuccess(newEmployment, entry.employmentId)
            })
          }
        >
          Rattacher
        </Button>
      ) : (
        <Button
          priority="tertiary no outline"
          size="small"
          iconPosition="left"
          iconId="fr-icon-logout-box-r-line"
          disabled={entry.id === adminStore.userId}
          onClick={() =>
            confirmActionIfOnlyAdmin(
              adminStore.teams,
              entry.id,
              `Mettre fin au rattachement du gestionnaire ${entry.name}`,
              () =>
                modals.open("terminateEmployment", {
                  inactiveEmployees: [entry],
                  onSuccess: handleBatchTerminateSuccess
                }),
              true
            )
          }
        >
          Détacher
        </Button>
      )
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
              iconId="fr-icon-arrow-go-forward-fill"
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
      const employment = companyEmployments.find(e => e.id === employmentId);
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

  const confirmActionIfOnlyAdmin = (
    teams,
    userId,
    modalTitle,
    action,
    terminateEmployment
  ) => {
    const teamsWhereUserIsOnlyAdmin = isUserOnlyAdminOfTeams(teams, userId);
    const nbTeamsOnlyAdmin = teamsWhereUserIsOnlyAdmin.length;
    const moreThanOne = nbTeamsOnlyAdmin > 1;
    const conditionalS = moreThanOne ? "s" : "";
    const conditionalX = moreThanOne ? "x" : "";
    nbTeamsOnlyAdmin > 0
      ? modals.open("confirmation", {
          textButtons: true,
          title: modalTitle,
          content: (
            <Box>
              <Typography>
                Ce gestionnaire est le seul gestionnaire rattaché au
                {conditionalX} groupe{conditionalS} suivant{conditionalS}:{" "}
                <span className="bold">
                  {teamsWhereUserIsOnlyAdmin.join(", ")}.
                </span>
              </Typography>
              <Typography>
                Si vous{" "}
                {terminateEmployment
                  ? "mettez fin à son rattachement"
                  : "lui retirez ses droits de gestion"}
                , il n'y aura plus de gestionnaire pour ce{conditionalS} groupe
                {conditionalS}.
              </Typography>
              <Typography>
                Êtes-vous certain(e) de vouloir{" "}
                {terminateEmployment
                  ? "mettre fin à son rattachement"
                  : "lui retirer ses droits de gestion"}
                ?
              </Typography>
            </Box>
          ),
          handleConfirm: async () => {
            await action();
          }
        })
      : action();
  };

  const inviteEmails = async (mails) => {
    await alerts.withApiErrorHandling(async () => {
      const employmentsResponse = await api.graphQlMutate(
        BATCH_CREATE_WORKER_EMPLOYMENTS_MUTATION,
        {
          companyId,
          mails
        }
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
      if (employments.length < mails.length) {
        alerts.warning(
          "Certaines invitations n'ont pu être envoyées, êtes-vous sûr(e) des adresses email ?",
          "batch-invite-warning",
          6000
        );
      } else
        alerts.success("Invitations envoyées !", "batch-invite-success", 6000);
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
      handleSubmit: inviteEmails
    });
  };

  const handleSingleInvite = () => {
    trackEvent(INVITE_NEW_EMPLOYEE_CLICK);
    setWantsToAddEmployment(true);
    setHidePendingEmployments(false);
  };

  const dissmissedBatchInviteCompanyIds = React.useMemo(() => {
    setHasClosedInviteModal(false);
    const cookie = readCookie("dismissBatchInvite");
    if (!cookie) {
      return [];
    }
    return JSON.parse(cookie);
  }, [companyId]);

  return (
    <>
      <BatchInviteModal
        open={
          isLoaded &&
          !hasMadeInvitations &&
          !dissmissedBatchInviteCompanyIds.includes(companyId) &&
          !hasClosedInviteModal
        }
        handleClose={() => {
          setCookie(
            "dismissBatchInvite",
            JSON.stringify([...dissmissedBatchInviteCompanyIds, companyId])
          );
          setHasClosedInviteModal(true);
        }}
        handleSubmit={inviteEmails}
        isNewAdmin={true}
      />
      <Stack direction="column" spacing={2}>
        {canDisplayPendingEmployments && (
          <>
            <Box className={classes.title}>
              <Typography variant="h4" component="h2">
                Invitations en attente ({pendingEmployments.length}){" "}
                {
                  <Button
                    disabled={isAddingEmployment}
                    className={classes.hideButton}
                    priority="tertiary"
                    size="small"
                    onClick={() => {
                      setHidePendingEmployments(!hidePendingEmployments);
                      setTimeout(
                        validEmploymentsTableRef.current.updateScrollPosition,
                        0
                      );
                    }}
                  >
                    {hidePendingEmployments ? "Afficher" : "Masquer"}
                  </Button>
                }
              </Typography>
              <Stack direction="row" columnGap={1}>
                <Button
                  priority="tertiary no outline"
                  size="small"
                  iconPosition="left"
                  iconId="fr-icon-arrow-go-forward-fill"
                  disabled={disableRemindAllPendingInvitations}
                  onClick={async () => {
                    await alerts.withApiErrorHandling(async () =>
                      sendInvitationsReminders(
                        pendingEmployments
                          .filter(
                            (e) =>
                              !e.latestInviteEmailTime ||
                              !isLessThanTwelveHoursAgo(e.latestInviteEmailTime)
                          )
                          .map((e) => e.id)
                      )
                    );
                  }}
                >
                  Relancer les invitations
                </Button>
                <InviteButtons
                  onBatchInvite={handleBatchInvite}
                  onSingleInvite={handleSingleInvite}
                  shouldShowBadge={
                    !hasMadeInvitations &&
                    !employeeProgressData?.shouldShowSingleInviteButton &&
                    employeeProgressData?.shouldShowBadge
                  }
                  employeeProgressData={employeeProgressData}
                />
              </Stack>
            </Box>
            {!hidePendingEmployments && (
              <AugmentedTable
                columns={pendingEmploymentColumns}
                entries={pendingEmployments}
                ref={pendingEmploymentsTableRef}
                onScroll={updateValidListScrollPosition}
                dense
                className={classes.augmentedTable}
                validateRow={({ idOrEmail, hasAdminRights }) =>
                  !!idOrEmail && !!hasAdminRights
                }
                forceParentUpdateOnRowAdd={() =>
                  setForceUpdate((value) => !value)
                }
                editActionsColumnMinWidth={180}
                defaultSortBy={"creationDate"}
                defaultSortType={"desc"}
                virtualized
                virtualizedRowHeight={56}
                virtualizedMaxHeight={"100%"}
                virtualizedAttachScrollTo={containerRef.current}
                onRowAdd={async ({ idOrEmail, hasAdminRights, teamId }) => {
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
                }}
              />
            )}
          </>
        )}

        <Box className={classes.title}>
          <Typography variant="h4" component="h2">
            Salariés ({validEmployments.length})
          </Typography>
          {!canDisplayPendingEmployments && (
            <InviteButtons
              onBatchInvite={handleBatchInvite}
              onSingleInvite={handleSingleInvite}
              shouldShowBadge={
                !hasMadeInvitations &&
                !employeeProgressData?.shouldShowSingleInviteButton &&
                employeeProgressData?.shouldShowBadge
              }
              employeeProgressData={employeeProgressData}
            />
          )}
        </Box>
        <Stack direction="row" alignItems="center" spacing={2}>
          {adminStore?.teams?.length > 0 && teams && (
            <TeamFilter
              teams={teams}
              setTeams={setTeams}
              orderByProperty="rankName"
            />
          )}
          <Box sx={{ flexGrow: 1 }}>
            <EmployeeProgressBar progressData={employeeProgressData} />
          </Box>
        </Stack>

        {areThereEmploymentsWithoutBusinessType && (
          <Notice
            description="Certains salariés n'ont pas de type d'activité de transport
            renseigné. Veuillez en sélectionner un pour chaque salarié actif."
          />
        )}
        {shouldShowInactiveBanner && (
          <Notice
            type="warning"
            onClose={handleDismissBanner}
            description={
              <>
                {formatPersonName(inactiveEmployees[0])} et{" "}
                {inactiveEmployees.length - 1} autres salariés n'ont pas
                enregistré de temps de travail depuis 3 mois. Pensez à détacher
                ces salariés s'ils ne font plus partie de votre entreprise, en
                sélectionnant l'option "détacher", ou{" "}
                <button
                  type="button"
                  onClick={handleOpenBatchTerminateModal}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    font: "inherit",
                    color: "inherit",
                    textDecoration: "underline",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center"
                  }}
                >
                  en cliquant ici&nbsp;→
                </button>
              </>
            }
          />
        )}
        <AugmentedTable
          columns={validEmploymentColumns}
          entries={validEmployments}
          virtualizedRowHeight={56}
          className={classes.augmentedTable}
          virtualizedMaxHeight={"100%"}
          ref={validEmploymentsTableRef}
          defaultSortBy="lastName"
          alwaysSortBy={[["isDetached", "asc"]]}
          virtualizedAttachScrollTo={containerRef.current}
          rowClassName={(row) =>
            !row.active ? classes.terminatedEmployment : ""
          }
          virtualized
        />
      </Stack>
    </>
  );
}
