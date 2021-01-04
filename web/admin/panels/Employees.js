import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  useApi,
  CREATE_EMPLOYMENT_MUTATION,
  CANCEL_EMPLOYMENT_MUTATION,
  TERMINATE_EMPLOYMENT_MUTATION
} from "common/utils/api";
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

const useStyles = makeStyles(theme => ({
  title: {
    textAlign: "left",
    marginBottom: theme.spacing(2)
  },
  subPanel: {
    padding: theme.spacing(2)
  },
  successText: {
    color: theme.palette.success.main
  },
  warningText: {
    color: theme.palette.warning.main
  }
}));

export function Employees({ companyId, containerRef }) {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

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
    try {
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
    } catch (err) {
      alerts.error(formatApiError(err), employmentId, 6000);
    }
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
      sortable: true,
      minWidth: 130
    },
    {
      label: "Fin rattachement",
      name: "endDate",
      format: (endDate, employment, onFocus) =>
        endDate ? (
          endDate
        ) : onFocus ? null : (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() =>
              modals.open("terminateEmployment", {
                minDate: new Date(employment.startDate),
                terminateEmployment: async endDate =>
                  await terminateEmployment(employment.employmentId, endDate)
              })
            }
          >
            Terminer
          </Button>
        ),
      align: "left",
      minWidth: 130
    },
    {
      label: "Statut",
      name: "active",
      format: active => (
        <Typography
          className={`bold ${
            active ? classes.successText : classes.warningText
          }`}
        >
          {active ? "Actif" : "Terminé"}
        </Typography>
      ),
      align: "left",
      sortable: true,
      minWidth: 100
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
      hasAdminRights: e.hasAdminRights
    }));

  return [
    <Typography key={0} variant="h4" className={classes.title}>
      Invitations en attente ({pendingEmployments.length})
    </Typography>,
    <AugmentedTable
      key={1}
      columns={pendingEmploymentColumns}
      entries={pendingEmployments}
      editable={false}
      onRowDelete={entry =>
        modals.open("confirmation", {
          textButtons: true,
          title: "Confirmer annulation du rattachement",
          handleConfirm: async () => await cancelEmployment(entry)
        })
      }
      disableAdd={({ idOrEmail }) => !idOrEmail}
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
      addButtonLabel="Inviter un nouveau salarié"
    />,
    <Box key={2} my={6}></Box>,
    <Typography key={3} variant="h4" className={classes.title}>
      Employés ({validEmployments.length})
    </Typography>,
    <AugmentedVirtualizedTable
      key={4}
      columns={validEmploymentColumns}
      entries={validEmployments}
      editable={false}
      rowHeight={60}
      maxHeight={"100%"}
      defaultSortBy="startDate"
      attachScrollTo={containerRef.current}
    />
  ];
}
