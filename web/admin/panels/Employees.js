import React from "react";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import {
  frenchFormatDateStringOrTimeStamp,
  isoFormatLocalDate,
  now
} from "common/utils/time";
import {
  BATCH_CREATE_WORKER_EMPLOYMENTS_MUTATION,
  CANCEL_EMPLOYMENT_MUTATION,
  CHANGE_EMPLOYEE_ROLE,
  CREATE_EMPLOYMENT_MUTATION,
  SEND_EMPLOYMENT_INVITE_REMINDER,
  TERMINATE_EMPLOYMENT_MUTATION
} from "common/utils/apiQueries";
import { ADMIN_ACTIONS } from "../store/reducers/root";
import { EMPLOYMENT_ROLE } from "common/utils/employments";
import { TeamFilter } from "../components/TeamFilter";
import { NO_TEAMS_LABEL, NO_TEAM_ID } from "../utils/teams";
import { BusinessDropdown } from "../components/BusinessDropdown";
import Stack from "@mui/material/Stack";
import Notice from "../../common/Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Explanation } from "../../common/typography/Explanation";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { readCookie, setCookie } from "common/utils/cookie";
import BatchInviteModal from "../modals/BatchInviteModal";

const useStyles = makeStyles(theme => ({
  title: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  successText: {
    color: theme.palette.success.main
  },
  augmentedTable: {
    marginRight: theme.spacing(10)
  },
  terminatedEmployment: {
    color: theme.palette.text.disabled
  },
  displayNone: {
    display: "none !important"
  },
  hideButton: {
    marginLeft: theme.spacing(2)
  }
}));

const isUserOnlyAdminOfTeams = (teams, userId) => {
  return teams
    .filter(
      team => team.adminUsers?.length === 1 && team.adminUsers[0].id === userId
    )
    .map(team => team.name);
};

export function Employees({ company, containerRef }) {
  const api = useApi();
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
        ...adminStore.teams.map(team => ({ ...team, rankName: team.name }))
      ]);
    } else {
      setTeams([]);
    }
  }, [adminStore.teams]);

  const selectedTeamIds = React.useMemo(() => {
    if (!teams) {
      return [];
    }
    return teams.filter(team => team.selected).map(team => team.id);
  }, [teams]);

  const setForceUpdate = React.useState({
    value: false
  })[1];

  const [hidePendingEmployments, setHidePendingEmployments] = React.useState(
    false
  );

  const classes = useStyles();

  const pendingEmploymentsTableRef = React.useRef();
  const validEmploymentsTableRef = React.useRef();

  const updateValidListScrollPosition = () =>
    setTimeout(validEmploymentsTableRef?.current?.updateScrollPosition, 0);

  async function cancelEmployment(employment) {
    try {
      await api.graphQlMutate(CANCEL_EMPLOYMENT_MUTATION, {
        employmentId: employment.id
      });
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.delete,
        payload: { id: employment.id, entity: "employments" }
      });
    } catch (err) {
      alerts.error(formatApiError(err), employment.id, 6000);
    }
  }

  async function changeEmployeeRole(employmentId, hasAdminRights) {
    try {
      const apiResponse = await api.graphQlMutate(CHANGE_EMPLOYEE_ROLE, {
        employmentId,
        hasAdminRights
      });
      const {
        teams,
        employments
      } = apiResponse?.data?.employments?.changeEmployeeRole;
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.update,
        payload: {
          id: employmentId,
          entity: "employments",
          update: {
            ...employments.find(employment => employment.id === employmentId),
            companyId,
            adminStore
          }
        }
      });
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.updateTeams,
        payload: { teams, employments }
      });
    } catch (err) {
      alerts.error(formatApiError(err), employmentId, 6000);
    }
  }

  async function giveAdminPermission(employmentId) {
    await changeEmployeeRole(employmentId, true);
  }

  async function giveWorkerPermission(employmentId) {
    await changeEmployeeRole(employmentId, false);
  }

  async function terminateEmployment(employmentId, endDate) {
    const employmentResponse = await api.graphQlMutate(
      TERMINATE_EMPLOYMENT_MUTATION,
      {
        employmentId,
        endDate: isoFormatLocalDate(endDate)
      }
    );
    await adminStore.dispatch({
      type: ADMIN_ACTIONS.update,
      payload: {
        id: employmentId,
        entity: "employments",
        update: {
          ...employmentResponse.data.employments.terminateEmployment,
          companyId
        }
      }
    });
  }

  async function sendInvitationReminder(employmentId) {
    await api.graphQlMutate(SEND_EMPLOYMENT_INVITE_REMINDER, { employmentId });
    await adminStore.dispatch({
      type: ADMIN_ACTIONS.update,
      payload: {
        id: employmentId,
        entity: "employments",
        update: { latestInviteEmailTime: now() }
      }
    });
    alerts.success("Relance envoyée", employmentId, 6000);
  }

  const formatTeam = teamId =>
    adminStore?.teams?.find(team => team.id === teamId)?.name;

  const pendingEmploymentColumns = [
    {
      label: "Nom",
      name: "name",
      minWidth: 75,
      baseWidth: 200,
      overflowTooltip: true,
      align: "left"
    },
    {
      label: "Identifiant ou email",
      name: "idOrEmail",
      create: true,
      sortable: true,
      minWidth: 200,
      baseWidth: 200,
      overflowTooltip: true,
      align: "left"
    },
    {
      label: "Accès gestionnaire",
      name: "hasAdminRights",
      create: true,
      minWidth: 160,
      baseWidth: 160,
      align: "left",
      required: true,
      format: hasAdminRights => (hasAdminRights ? "Oui" : "Non"),
      renderEditMode: (type, entry, setType) => (
        <TextField
          required
          fullWidth
          select
          value={type}
          onChange={e => setType(e.target.value)}
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
      format: dateString =>
        dateString ? frenchFormatDateStringOrTimeStamp(dateString) : "",
      sortable: true,
      name: "creationDate",
      minWidth: 160,
      baseWidth: 160,
      align: "left"
    },
    {
      label: "Dernière relance le",
      name: "latestInviteEmailDateString",
      minWidth: 160,
      baseWidth: 160,
      align: "left"
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
          onChange={e => setType(e.target.value)}
        >
          <MenuItem key={NO_TEAM_ID} value={NO_TEAM_ID}>
            {"-"}
          </MenuItem>
          {adminStore.teams.map(team => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </TextField>
      )
    });
  }

  const validEmploymentColumns = [
    {
      label: "Nom",
      name: "lastName",
      align: "left",
      sortable: true,
      minWidth: 120,
      overflowTooltip: true
    },
    {
      label: "Prénom",
      name: "firstName",
      align: "left",
      sortable: true,
      minWidth: 120,
      overflowTooltip: true
    },
    {
      label: "Identifiant",
      name: "id",
      align: "left",
      minWidth: 160,
      baseWidth: 160
    },
    {
      label: "Email",
      name: "email",
      align: "left",
      sortable: true,
      minWidth: 320,
      overflowTooltip: true
    },
    {
      label: "Accès gestionnaire",
      name: "hasAdminRights",
      format: hasAdminRights => (hasAdminRights ? "Oui" : "Non"),
      align: "left",
      sortable: true,
      minWidth: 160
    },
    {
      label: "Début rattachement",
      name: "startDate",
      align: "left",
      format: startDate => frenchFormatDateStringOrTimeStamp(startDate),
      sortable: true,
      minWidth: 150
    },
    {
      label: "Fin rattachement",
      name: "endDate",
      format: endDate =>
        endDate ? frenchFormatDateStringOrTimeStamp(endDate) : null,
      align: "left",
      minWidth: 150
    },
    {
      label: "Statut",
      name: "active",
      format: active => (
        <Typography
          className={`bold ${
            active ? classes.successText : classes.terminatedEmployment
          }`}
        >
          {active ? "Actif" : "Terminé"}
        </Typography>
      ),
      align: "left",
      minWidth: 80
    }
  ];

  if (adminStore?.teams?.length > 0) {
    validEmploymentColumns.push({
      label: "Groupe d'affectation",
      name: "teamId",
      align: "left",
      format: formatTeam,
      minWidth: 140,
      overflowTooltip: true
    });
  }

  validEmploymentColumns.push({
    label: "Type d'activité",
    name: "business",
    align: "left",
    format: (business, { employmentId }) => (
      <BusinessDropdown
        business={business}
        companyId={companyId}
        employmentId={employmentId}
      />
    ),
    minWidth: 200,
    overflowTooltip: true
  });

  const companyEmployments = React.useMemo(
    () => adminStore.employments.filter(e => e.companyId === companyId),
    [adminStore.employments, companyId]
  );

  const pendingEmployments = React.useMemo(
    () =>
      companyEmployments
        .filter(e => !e.isAcknowledged)
        .map(e => ({
          pending: true,
          idOrEmail: e.email || e.user?.id,
          name: e.user ? formatPersonName(e.user, true) : null,
          hasAdminRights: e.hasAdminRights,
          creationDate: e.startDate,
          latestInviteEmailDateString: frenchFormatDateStringOrTimeStamp(
            e.latestInviteEmailTime
              ? e.latestInviteEmailTime * 1000
              : e.startDate
          ),
          id: e.id,
          teamId: e.teamId,
          employmentId: e.id,
          userId: e.user?.id,
          companyId: e.company?.id
        })),
    [companyEmployments]
  );

  const hasMadeInvitations = React.useMemo(
    () =>
      companyEmployments.filter(e => e.user?.id !== adminStore.userId).length >
      0,
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
        .filter(e => {
          return (
            selectedTeamIds.length === 0 ||
            selectedTeamIds.includes(e.teamId) ||
            (selectedTeamIds.includes(NO_TEAM_ID) && !e.teamId)
          );
        })
        .filter(e => e.isAcknowledged)
        .map(e => ({
          pending: false,
          id: e.user.id,
          email: e.user.email,
          employmentId: e.id,
          lastName: e.user.lastName,
          firstName: e.user.firstName,
          name: formatPersonName(e.user),
          startDate: e.startDate,
          endDate: e.endDate,
          active: !e.endDate || e.endDate >= today,
          hasAdminRights: e.hasAdminRights ? 1 : 0,
          teamId: e.teamId,
          userId: e.user.id,
          companyId: e.company.id,
          business: e.business
        })),
    [companyEmployments, selectedTeamIds]
  );

  const areThereEmploymentsWithoutBusinessType = React.useMemo(
    () => validEmployments.filter(e => !e.business).length > 0,
    [validEmployments]
  );

  const isAddingEmployment =
    pendingEmploymentsTableRef.current &&
    pendingEmploymentsTableRef.current.isAddingRow &&
    pendingEmploymentsTableRef.current.isAddingRow();

  const canDisplayPendingEmployments =
    isAddingEmployment || pendingEmployments.length > 0;

  const customActionEditTeam = {
    name: "editTeam",
    label: "Modifier l'affectation",
    action: employment => {
      modals.open("employeesTeamRevisionModal", {
        employment,
        teams: adminStore?.teams,
        companyId,
        adminStore
      });
    }
  };

  const customActionsPendingEmployment = employment => {
    if (!employment) {
      return [];
    }
    const customActions = [
      {
        name: "reminder",
        label: "Relancer l'invitation",
        action: async empl => {
          await alerts.withApiErrorHandling(async () =>
            sendInvitationReminder(empl.id)
          );
        }
      },
      {
        name: "delete",
        label: "Annuler l'invitation",
        action: empl => {
          modals.open("confirmation", {
            textButtons: true,
            title: "Confirmer annulation du rattachement",
            handleConfirm: async () =>
              alerts.withApiErrorHandling(
                async () => cancelEmployment(empl),
                "cancel-employment"
              )
          });
        }
      }
    ];
    if (!employment.hasAdminRights) {
      customActions.push({
        name: "setAdmin",
        label: "Donner accès gestionnaire",
        action: empl => giveAdminPermission(empl.id)
      });
    } else {
      customActions.push({
        name: "setWorker",
        label: "Retirer accès gestionnaire",
        disabled: employment.id === adminStore.userId,
        action: empl => giveWorkerPermission(empl.employmentId)
      });
    }
    if (adminStore?.teams?.length > 0) {
      customActions.unshift(customActionEditTeam);
    }
    return customActions;
  };

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

  const customActionsValidEmployment = employment => {
    if (!employment) {
      return [];
    }
    const customActions = [];
    if (adminStore?.teams?.length > 0) {
      customActions.push(customActionEditTeam);
    }
    if (!employment.hasAdminRights) {
      customActions.push({
        name: "setAdmin",
        label: "Donner accès gestionnaire",
        action: empl => giveAdminPermission(empl.employmentId)
      });
    } else {
      customActions.push({
        name: "setWorker",
        label: "Retirer accès gestionnaire",
        disabled: employment.id === adminStore.userId,
        action: empl =>
          confirmActionIfOnlyAdmin(
            adminStore.teams,
            empl.id,
            `Retirer l'accès gestionnaire à ${employment.name}`,
            () => giveWorkerPermission(empl.employmentId),
            false
          )
      });
    }
    customActions.push({
      name: "terminate",
      label: "Mettre fin au rattachement",
      disabled: employment.id === adminStore.userId,
      action: empl =>
        confirmActionIfOnlyAdmin(
          adminStore.teams,
          empl.id,
          `Mettre fin au rattachement du gestionnaire ${employment.name}`,
          () =>
            modals.open("terminateEmployment", {
              minDate: new Date(empl.startDate),
              terminateEmployment: async endDate =>
                terminateEmployment(empl.employmentId, endDate)
            }),
          true
        )
    });
    return customActions;
  };

  const inviteEmails = async mails => {
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
          items: employments.map(e => ({ ...e, companyId })),
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
        <Button
          priority="secondary"
          size="small"
          sx={{
            marginRight: "auto"
          }}
          onClick={() =>
            modals.open("batchInvite", {
              handleSubmit: inviteEmails
            })
          }
        >
          Inviter une liste d'emails
        </Button>
        <Box
          className={`${
            canDisplayPendingEmployments ? "" : classes.displayNone
          } ${classes.title}`}
        >
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
          <Button
            size="small"
            onClick={() => {
              setHidePendingEmployments(false);
              pendingEmploymentsTableRef.current.newRow({
                hasAdminRights: EMPLOYMENT_ROLE.employee,
                teamId: NO_TEAM_ID
              });
            }}
          >
            Inviter un nouveau salarié
          </Button>
        </Box>
        <AugmentedTable
          columns={pendingEmploymentColumns}
          entries={pendingEmployments}
          ref={pendingEmploymentsTableRef}
          onScroll={updateValidListScrollPosition}
          dense
          className={`${
            canDisplayPendingEmployments && !hidePendingEmployments
              ? ""
              : classes.displayNone
          } ${classes.augmentedTable}`}
          validateRow={({ idOrEmail, hasAdminRights }) =>
            !!idOrEmail && !!hasAdminRights
          }
          forceParentUpdateOnRowAdd={() => setForceUpdate(value => !value)}
          editActionsColumnMinWidth={180}
          defaultSortBy={"creationDate"}
          defaultSortType={"desc"}
          virtualized
          virtualizedRowHeight={45}
          virtualizedMaxHeight={"100%"}
          virtualizedAttachScrollTo={
            canDisplayPendingEmployments ? containerRef.current : null
          }
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
          customRowActions={customActionsPendingEmployment}
        />
        <Box className={classes.title}>
          <Typography variant="h4" component="h2">
            Salariés ({validEmployments.length})
          </Typography>
          {!canDisplayPendingEmployments && (
            <Button
              size="small"
              onClick={() =>
                pendingEmploymentsTableRef.current.newRow({
                  hasAdminRights: EMPLOYMENT_ROLE.employee
                })
              }
            >
              {!hasMadeInvitations && (
                <Badge severity="new" small style={{ marginRight: "8px" }}>
                  A Faire
                </Badge>
              )}
              Inviter un nouveau salarié
            </Button>
          )}
        </Box>
        <Explanation>
          Invitez vos salariés en renseignant leurs adresses e-mail (certaines
          adresses n’apparaissent pas dans la liste ci-dessous car les salariés
          ont choisi de ne pas vous les communiquer), afin qu'ils puissent
          enregistrer du temps de travail pour l'entreprise.
        </Explanation>

        {areThereEmploymentsWithoutBusinessType && (
          <Notice
            description="Certains salariés n'ont pas de type d'activité de transport
            renseigné. Veuillez en sélectionner un pour chaque salarié actif."
          />
        )}
        <Grid container>
          {adminStore?.teams?.length > 0 && (
            <Grid item sm={2} flexGrow={1}>
              {teams && (
                <TeamFilter
                  teams={teams}
                  setTeams={setTeams}
                  orderByProperty="rankName"
                />
              )}
            </Grid>
          )}
        </Grid>
        <AugmentedTable
          columns={validEmploymentColumns}
          entries={validEmployments}
          virtualizedRowHeight={45}
          className={classes.augmentedTable}
          virtualizedMaxHeight={"100%"}
          ref={validEmploymentsTableRef}
          defaultSortBy="lastName"
          alwaysSortBy={[["active", "desc"]]}
          virtualizedAttachScrollTo={containerRef.current}
          rowClassName={row =>
            !row.active ? classes.terminatedEmployment : ""
          }
          customRowActions={customActionsValidEmployment}
          virtualized
        />
      </Stack>
    </>
  );
}
