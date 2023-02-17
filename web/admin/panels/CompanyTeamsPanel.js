import React from "react";
import { useApi } from "common/utils/api";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  ALL_TEAMS_COMPANY_QUERY,
  DELETE_TEAM_MUTATION
} from "common/utils/apiQueries";
import { usePanelStyles } from "./Company";
import Skeleton from "@mui/material/Skeleton";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { useModals } from "common/utils/modals";
import { AugmentedTable } from "../components/AugmentedTable";
import { captureSentryException } from "common/utils/sentry";
import { Alert } from "@mui/material";
import { isoFormatDay, isoFormatLocalDate } from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { useAdminStore } from "../store/store";

export default function CompanyTeamsPanel({ company }) {
  const api = useApi();
  const modals = useModals();
  const adminStore = useAdminStore();

  const [teams, setTeams] = React.useState([]);
  const [loadingTeams, setLoadingTeams] = React.useState(false);

  React.useEffect(async () => {
    setLoadingTeams(true);
    const apiResponse = await api.graphQlQuery(ALL_TEAMS_COMPANY_QUERY, {
      companyId: company.id
    });
    setTeams(apiResponse?.data?.company?.teams);
    setLoadingTeams(false);
  }, [company]);

  const classes = usePanelStyles();

  const teamColumns = [
    {
      label: "Nom",
      name: "name",
      sortable: true
    },
    {
      label: "Gestionnaire(s)",
      name: "adminUsers",
      format: adminUsers =>
        adminUsers
          ?.map(adminUser => formatPersonName(adminUser))
          .sort()
          .join(", "),
      overflowTooltip: true,
      sortable: true
    },
    {
      label: "Salarié(s)",
      name: "users",
      format: users =>
        users
          ?.map(user => formatPersonName(user))
          .sort()
          .join(", "),
      overflowTooltip: true,
      sortable: true
    },
    {
      label: "Adresse(s)",
      name: "knownAddresses",
      format: knownAddresses =>
        knownAddresses
          ?.map(address => address.alias || address.name)
          .sort()
          .join(", "),
      overflowTooltip: true,
      sortable: true
    },
    {
      label: "Véhicule(s)",
      name: "vehicles",
      format: vehicles =>
        vehicles
          ?.map(vehicle => vehicle.name)
          .sort()
          .join(", "),
      overflowTooltip: true,
      maxWidth: 150,
      sortable: true
    },
    {
      label: "Date de création",
      name: "creationTime",
      format: creationTime => isoFormatDay(creationTime),
      sortable: true
    }
  ];

  function openTeamModal() {
    const currentUsers = adminStore.employments
      .filter(
        e =>
          e.companyId === adminStore.companyId &&
          e.isAcknowledged &&
          (!e.endDate || e.endDate >= isoFormatLocalDate(new Date()))
      )
      .map(e => e.user);
    const currentAdmins = adminStore.employments
      .filter(
        e =>
          e.companyId === adminStore.companyId &&
          e.isAcknowledged &&
          e.hasAdminRights &&
          (!e.endDate || e.endDate >= isoFormatLocalDate(new Date()))
      )
      .map(e => e.user);
    modals.open("companyTeamCreationRevisionModal", {
      company: company,
      selectableUsers: currentUsers,
      selectableAdmins: currentAdmins,
      setTeams: setTeams
    });
  }

  return [
    <Grid key={0} container>
      <Grid item xs={6}>
        <Box className={classes.title}>
          <Typography variant="h4">
            Équipes {!loadingTeams && <span> ({teams?.length || 0})</span>}
          </Typography>
        </Box>
      </Grid>
      <Grid item xs={6} className={classes.buttonAddToken}>
        <Button
          size="small"
          color="primary"
          variant="contained"
          onClick={() => openTeamModal()}
        >
          Ajouter une nouvelle équipe
        </Button>
      </Grid>
    </Grid>,
    loadingTeams && (
      <Skeleton key={2} variant="rectangular" width="100%" height={100} />
    ),
    !loadingTeams && teams?.length === 0 && (
      <Alert key={1} severity="info">
        <Typography>
          Si vos salariés sont répartis en équipes et que leurs temps de travail
          sont gérés par des gestionnaires différents, vous avez la possibilité
          de créer des équipes dans cet onglet. Les gestionnaires n'auront accès
          qu'aux temps de travail de l'équipe à laquelle ils sont affiliés.
        </Typography>
      </Alert>
    ),
    !loadingTeams && teams?.length > 0 && (
      <AugmentedTable
        key={2}
        columns={teamColumns}
        entries={teams}
        className={classes.vehiclesTable}
        defaultSortBy="name"
        onRowDelete={team =>
          modals.open("confirmation", {
            textButtons: true,
            title: "Confirmer suppression",
            handleConfirm: async () => {
              try {
                await api.graphQlMutate(DELETE_TEAM_MUTATION, {
                  id: team.id
                });
              } catch (err) {
                captureSentryException(err);
              }
            }
          })
        }
      />
    )
  ];
}
