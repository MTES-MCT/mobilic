import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import {
  useApi,
  CREATE_EMPLOYMENT_MUTATION,
  CANCEL_EMPLOYMENT_MUTATION,
  TERMINATE_EMPLOYMENT_MUTATION
} from "common/utils/api";
import { useAdminStore } from "../utils/store";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import { useModals } from "common/utils/modals";

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

export function Employees() {
  const api = useApi();
  const adminStore = useAdminStore();
  const modals = useModals();

  const classes = useStyles();

  async function cancelEmployment(employmentId) {
    try {
      await api.graphQlMutate(CANCEL_EMPLOYMENT_MUTATION, {
        employmentId
      });
      await adminStore.setEmployments(oldEmployments =>
        oldEmployments.filter(e => e.id !== employmentId)
      );
    } catch (err) {
      console.log(err);
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
        newEmployments[employmentIndex] =
          employmentResponse.data.employments.terminateEmployment;
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
    },
    {
      label: "",
      name: "cancelEmployment",
      format: employmentId => (
        <Button
          variant="outlined"
          color="primary"
          onClick={() =>
            modals.open("confirmation", {
              textButtons: true,
              title: "Confirmer annulation du rattachement",
              handleConfirm: async () => await cancelEmployment(employmentId)
            })
          }
        >
          Annuler
        </Button>
      )
    }
  ];

  const validEmploymentColumns = [
    {
      label: "Nom",
      name: "name"
    },
    {
      label: "Identifiant",
      name: "id"
    },
    {
      label: "Administrateur",
      name: "hasAdminRights",
      boolean: true
    },
    {
      label: "Début rattachement",
      name: "startDate"
    },
    {
      label: "Fin rattachement",
      name: "endDate",
      format: (endDate, employment) =>
        endDate ? (
          endDate
        ) : (
          <Button
            variant="outlined"
            color="primary"
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
        )
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
      )
    }
  ];

  const pendingEmployments = adminStore.employments
    .filter(e => !e.isAcknowledged)
    .map(e => ({
      idOrEmail: e.user ? e.user.id : e.email,
      name: e.user ? formatPersonName(e.user) : null,
      hasAdminRights: e.hasAdminRights,
      creationDate: e.startDate,
      cancelEmployment: e.id
    }));

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const validEmployments = adminStore.employments
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
      Invitations en attente
    </Typography>,
    <AugmentedTable
      key={1}
      columns={pendingEmploymentColumns}
      entries={pendingEmployments}
      editable={false}
      onRowAdd={async ({ idOrEmail, hasAdminRights }) => {
        const payload = {
          hasAdminRights,
          companyId: adminStore.companyId
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
            apiResponse.data.employments.createEmployment,
            ...oldEmployments
          ]);
        } catch (err) {
          console.log(err);
        }
      }}
      addButtonLabel="Inviter un nouveau salarié"
    />,
    <Box key={2} my={6}></Box>,
    <Typography key={3} variant="h4" className={classes.title}>
      Employés
    </Typography>,
    <AugmentedTable
      key={4}
      columns={validEmploymentColumns}
      entries={validEmployments}
      editable={false}
    />
  ];
}
