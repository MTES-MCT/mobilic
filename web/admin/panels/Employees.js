import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useApi } from "common/utils/api";
import { useAdminStore } from "../utils/store";
import {
  AugmentedTable,
  AugmentedVirtualizedTable
} from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import IconButton from "@material-ui/core/IconButton";
import { frenchFormatDateString } from "common/utils/time";
import {
  CANCEL_EMPLOYMENT_MUTATION,
  CREATE_EMPLOYMENT_MUTATION,
  TERMINATE_EMPLOYMENT_MUTATION
} from "common/utils/apiQueries";

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
  subPanel: {
    padding: theme.spacing(2)
  },
  successText: {
    color: theme.palette.success.main
  },
  warningText: {
    color: theme.palette.warning.main
  },
  pendingEmployments: {
    marginBottom: theme.spacing(10)
  },
  terminatedEmployment: {
    color: theme.palette.text.disabled
  }
}));

export function Employees({ company, containerRef }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();
  const companyId = company ? company.id : null;

  const [triggerAddEmployee, setTriggerAddEmployee] = React.useState({
    value: false
  });

  const classes = useStyles();

  async function cancelEmployment(employment) {
    try {
      await api.graphQlMutate(CANCEL_EMPLOYMENT_MUTATION, {
        employmentId: employment.id
      });
      await adminStore.setEmployments(oldEmployments =>
        oldEmployments.filter(e => e.id !== employment.id)
      );
    } catch (err) {
      alerts.error(formatApiError(err), employment.id, 6000);
    }
  }

  async function terminateEmployment(employmentId, endDate) {
    const employmentResponse = await api.graphQlMutate(
      TERMINATE_EMPLOYMENT_MUTATION,
      {
        employmentId,
        endDate: endDate.toISOString().slice(0, 10)
      }
    );
    await adminStore.setEmployments(oldEmployments => {
      const newEmployments = [...oldEmployments];
      const employmentIndex = oldEmployments.findIndex(
        e => e.id === employmentId
      );
      if (employmentIndex >= 0)
        newEmployments[employmentIndex] = {
          ...employmentResponse.data.employments.terminateEmployment,
          companyId
        };
      return newEmployments;
    });
  }

  const pendingEmploymentColumns = [
    {
      label: "Nom",
      name: "name"
    },
    {
      label: "Identifiant ou email",
      name: "idOrEmail",
      create: true
    },
    {
      label: "Administrateur",
      name: "hasAdminRights",
      boolean: true,
      create: true
    },
    {
      label: "Invité le",
      name: "creationDate"
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
      label: "Administrateur",
      name: "hasAdminRights",
      boolean: true,
      align: "left",
      sortable: true,
      minWidth: 120
    },
    {
      label: "Début rattachement",
      name: "startDate",
      align: "left",
      format: startDate => frenchFormatDateString(startDate),
      sortable: true,
      minWidth: 130
    },
    {
      label: "Fin rattachement",
      name: "endDate",
      format: endDate => (endDate ? frenchFormatDateString(endDate) : null),
      align: "left",
      minWidth: 130
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
    },
    {
      label: "",
      name: "actions",
      format: (_, employment) =>
        employment.endDate ? null : (
          <IconButton
            color="primary"
            onClick={e => handleActionsClick(e, employment)}
          >
            <MoreVertIcon />
          </IconButton>
        ),
      align: "left",
      baseWidth: 65,
      minWidth: 65
    }
  ];

  const companyEmployments = adminStore.employments.filter(
    e => e.companyId === companyId
  );

  const pendingEmployments = companyEmployments
    .filter(e => !e.isAcknowledged)
    .map(e => ({
      idOrEmail: e.user ? e.user.id : e.email,
      name: e.user ? formatPersonName(e.user) : null,
      hasAdminRights: e.hasAdminRights,
      creationDate: e.startDate,
      id: e.id
    }));

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const validEmployments = companyEmployments
    .filter(e => e.isAcknowledged)
    .map(e => ({
      id: e.user.id,
      employmentId: e.id,
      name: formatPersonName(e.user),
      startDate: e.startDate,
      endDate: e.endDate,
      active: !e.endDate || e.endDate >= today,
      hasAdminRights: e.hasAdminRights ? 1 : 0
    }));

  const [actionMenuAnchorEl, setActionMenuAnchorEl] = React.useState(null);
  const [employmentActedOn, setEmploymentActedOn] = React.useState(null);

  const handleActionsClick = (event, empl) => {
    setActionMenuAnchorEl(event.currentTarget);
    setEmploymentActedOn(empl);
  };

  const handleActionsMenuClose = () => {
    setActionMenuAnchorEl(null);
    setEmploymentActedOn(null);
  };

  return [
    (triggerAddEmployee.value || pendingEmployments.length > 0) && (
      <Box key={0} className={classes.title}>
        <Typography variant="h4">
          Invitations en attente ({pendingEmployments.length})
        </Typography>
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => setTriggerAddEmployee({ value: true })}
          className={classes.actionButton}
        >
          Inviter un nouveau salarié
        </Button>
      </Box>
    ),
    (triggerAddEmployee.value || pendingEmployments.length > 0) && (
      <AugmentedTable
        key={1}
        columns={pendingEmploymentColumns}
        entries={pendingEmployments}
        editable={false}
        className={classes.pendingEmployments}
        onRowDelete={entry =>
          modals.open("confirmation", {
            textButtons: true,
            title: "Confirmer annulation du rattachement",
            handleConfirm: async () =>
              await alerts.withApiErrorHandling(
                async () => cancelEmployment(entry),
                "cancel-employment"
              )
          })
        }
        disableAdd={({ idOrEmail }) => !idOrEmail}
        triggerRowAdd={triggerAddEmployee}
        onRowAdd={async ({ idOrEmail, hasAdminRights }) => {
          const payload = {
            hasAdminRights,
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
            adminStore.setEmployments(oldEmployments => [
              { ...apiResponse.data.employments.createEmployment, companyId },
              ...oldEmployments
            ]);
          } catch (err) {
            alerts.error(formatApiError(err), idOrEmail, 6000);
          }
        }}
        afterRowAdd={() => setTriggerAddEmployee({ value: false })}
      />
    ),
    <Box key={3} className={classes.title}>
      <Typography variant="h4">Employés ({validEmployments.length})</Typography>
      {pendingEmployments.length === 0 && !triggerAddEmployee.value && (
        <Button
          variant="contained"
          size="small"
          color="primary"
          onClick={() => setTriggerAddEmployee({ value: true })}
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
    <AugmentedVirtualizedTable
      key={5}
      columns={validEmploymentColumns}
      entries={validEmployments}
      editable={false}
      rowHeight={60}
      maxHeight={"100%"}
      defaultSortBy="name"
      alwaysSortBy={[["active", "desc"]]}
      attachScrollTo={containerRef.current}
      rowClassName={(index, row) =>
        !row.active ? classes.terminatedEmployment : ""
      }
    />,
    <Menu
      key={6}
      keepMounted
      open={Boolean(actionMenuAnchorEl)}
      onClose={handleActionsMenuClose}
      anchorEl={actionMenuAnchorEl}
    >
      <MenuItem
        onClick={() => {
          modals.open("terminateEmployment", {
            minDate: new Date(employmentActedOn.startDate),
            terminateEmployment: async endDate =>
              await terminateEmployment(employmentActedOn.employmentId, endDate)
          });
          handleActionsMenuClose();
        }}
      >
        Mettre fin au rattachement
      </MenuItem>
    </Menu>
  ];
}
