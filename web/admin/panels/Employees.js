import React from "react";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../store/store";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
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

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.spacing(2),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  explanation: {
    marginBottom: theme.spacing(2),
    fontStyle: "italic",
    textAlign: "justify"
  },
  successText: {
    color: theme.palette.success.main
  },
  warningText: {
    color: theme.palette.warning.main
  },
  pendingEmployments: {
    marginBottom: theme.spacing(10),
    marginRight: theme.spacing(10)
  },
  acceptedEmployments: {
    marginRight: theme.spacing(10)
  },
  terminatedEmployment: {
    color: theme.palette.text.disabled
  },
  displayNone: {
    display: "none !important"
  },
  batchInviteButton: {
    marginBottom: theme.spacing(2)
  },
  hideButton: {
    marginLeft: theme.spacing(2)
  }
}));

export function Employees({ company, containerRef }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const companyId = company ? company.id : null;

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
      const employmentResponse = await api.graphQlMutate(CHANGE_EMPLOYEE_ROLE, {
        employmentId,
        hasAdminRights
      });
      await adminStore.dispatch({
        type: ADMIN_ACTIONS.update,
        payload: {
          id: employmentId,
          entity: "employments",
          update: {
            ...employmentResponse.data.employments.changeEmployeeRole,
            companyId
          }
        }
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

  const pendingEmploymentColumns = [
    {
      label: "Nom",
      name: "name",
      minWidth: 50,
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

  const validEmploymentColumns = [
    {
      label: "Nom",
      name: "name",
      align: "left",
      sortable: true,
      minWidth: 200,
      overflowTooltip: true
    },
    {
      label: "Identifiant",
      name: "id",
      align: "left",
      minWidth: 100
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
      minWidth: 100
    }
  ];

  const companyEmployments = adminStore.employments.filter(
    e => e.companyId === companyId
  );

  const pendingEmployments = companyEmployments
    .filter(e => !e.isAcknowledged)
    .map(e => ({
      pending: true,
      idOrEmail: e.user ? e.user.id : e.email,
      name: e.user ? formatPersonName(e.user) : null,
      hasAdminRights: e.hasAdminRights,
      creationDate: e.startDate,
      latestInviteEmailDateString: frenchFormatDateStringOrTimeStamp(
        e.latestInviteEmailTime ? e.latestInviteEmailTime * 1000 : e.startDate
      ),
      id: e.id
    }));

  const today = isoFormatLocalDate(new Date());

  const validEmployments = companyEmployments
    .filter(e => e.isAcknowledged)
    .map(e => ({
      pending: false,
      id: e.user.id,
      employmentId: e.id,
      name: formatPersonName(e.user),
      startDate: e.startDate,
      endDate: e.endDate,
      active: !e.endDate || e.endDate >= today,
      hasAdminRights: e.hasAdminRights ? 1 : 0
    }));

  const isAddingEmployment =
    pendingEmploymentsTableRef.current &&
    pendingEmploymentsTableRef.current.isAddingRow &&
    pendingEmploymentsTableRef.current.isAddingRow();

  const canDisplayPendingEmployments =
    isAddingEmployment || pendingEmployments.length > 0;

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
        action: empl => giveWorkerPermission(empl.id)
      });
    }
    return customActions;
  };

  const customActionsValidEmployment = employment => {
    if (!employment) {
      return [];
    }
    const customActions = [];
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
        action: empl => giveWorkerPermission(empl.employmentId)
      });
    }
    customActions.push({
      name: "terminate",
      label: "Mettre fin au rattachement",
      disabled: employment.id === adminStore.userId,
      action: empl => {
        modals.open("terminateEmployment", {
          minDate: new Date(empl.startDate),
          terminateEmployment: async endDate =>
            terminateEmployment(empl.employmentId, endDate)
        });
      }
    });
    return customActions;
  };

  return [
    <Button
      key={-1}
      color="primary"
      variant="outlined"
      size="small"
      className={classes.batchInviteButton}
      onClick={() =>
        modals.open("batchInvite", {
          handleSubmit: async mails => {
            await alerts.withApiErrorHandling(async () => {
              const employmentsResponse = await api.graphQlMutate(
                BATCH_CREATE_WORKER_EMPLOYMENTS_MUTATION,
                {
                  companyId,
                  mails
                }
              );
              const employments =
                employmentsResponse.data.employments
                  .batchCreateWorkerEmployments;
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
                alerts.success(
                  "Invitations envoyées !",
                  "batch-invite-success",
                  6000
                );
              setTimeout(
                validEmploymentsTableRef.current.updateScrollPosition,
                0
              );
            });
          }
        })
      }
    >
      Inviter une liste d'emails
    </Button>,
    <Box
      key={0}
      className={`${canDisplayPendingEmployments ? "" : classes.displayNone} ${
        classes.title
      }`}
    >
      <Typography variant="h4">
        Invitations en attente ({pendingEmployments.length}){" "}
        {
          <Button
            disabled={isAddingEmployment}
            color="primary"
            className={classes.hideButton}
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
        variant="contained"
        size="small"
        color="primary"
        onClick={() => {
          setHidePendingEmployments(false);
          pendingEmploymentsTableRef.current.newRow();
        }}
        className={classes.actionButton}
      >
        Inviter un nouveau salarié
      </Button>
    </Box>,
    <AugmentedTable
      key={1}
      columns={pendingEmploymentColumns}
      entries={pendingEmployments}
      ref={pendingEmploymentsTableRef}
      onScroll={updateValidListScrollPosition}
      dense
      className={`${
        canDisplayPendingEmployments && !hidePendingEmployments
          ? ""
          : classes.displayNone
      } ${classes.pendingEmployments}`}
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
      onRowAdd={async ({ idOrEmail, hasAdminRights }) => {
        const payload = {
          hasAdminRights: hasAdminRights === EMPLOYMENT_ROLE.admin,
          companyId
        };
        if (/^\d+$/.test(idOrEmail)) {
          payload.userId = parseInt(idOrEmail);
        } else {
          payload.mail = idOrEmail;
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
                { ...apiResponse.data.employments.createEmployment, companyId }
              ],
              entity: "employments"
            }
          });
        } catch (err) {
          alerts.error(formatApiError(err), idOrEmail, 6000);
        }
      }}
      customRowActions={customActionsPendingEmployment}
    />,
    <Box key={3} className={classes.title}>
      <Typography variant="h4">Salariés ({validEmployments.length})</Typography>
      {!canDisplayPendingEmployments && (
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => pendingEmploymentsTableRef.current.newRow()}
          className={classes.actionButton}
        >
          Inviter un nouveau salarié
        </Button>
      )}
    </Box>,
    <Typography key={4} className={classes.explanation}>
      Invitez vos salariés en renseignant leurs adresses mail, afin qu'ils
      puissent enregistrer du temps de travail pour l'entreprise.
    </Typography>,
    <AugmentedTable
      key={5}
      columns={validEmploymentColumns}
      entries={validEmployments}
      virtualizedRowHeight={45}
      className={classes.acceptedEmployments}
      virtualizedMaxHeight={"100%"}
      ref={validEmploymentsTableRef}
      defaultSortBy="name"
      alwaysSortBy={[["active", "desc"]]}
      virtualizedAttachScrollTo={containerRef.current}
      rowClassName={row => (!row.active ? classes.terminatedEmployment : "")}
      customRowActions={customActionsValidEmployment}
      virtualized
    />
  ];
}
