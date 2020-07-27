import React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { useApi, CREATE_EMPLOYMENT_MUTATION } from "common/utils/api";
import { useAdminStore } from "../utils/store";
import { AugmentedTable } from "../components/AugmentedTable";
import { formatPersonName } from "common/utils/coworkers";
import Typography from "@material-ui/core/Typography";
import Box from "@material-ui/core/Box";

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

  const classes = useStyles();

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
      name: "endDate"
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
      creationDate: e.startDate
    }));

  const today = new Date(Date.now()).toISOString().slice(0, 10);

  const validEmployments = adminStore.employments
    .filter(e => e.isAcknowledged)
    .map(e => ({
      id: e.user.id,
      name: formatPersonName(e.user),
      startDate: e.startDate,
      endDate: e.endDate,
      active: !e.endDate || e.endDate() >= today,
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
          adminStore.setPendingEmployments(oldEmployments => [
            apiResponse.data.admin.createEmployment,
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
