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
import { Alert } from "@mui/material";
import { formatDay, isoFormatLocalDate } from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { useAdminStore } from "../store/store";
import { useSnackbarAlerts } from "../../common/Snackbar";
import uniqBy from "lodash/uniqBy";
import { ADMIN_ACTIONS } from "../store/reducers/root";

export default function CompanyTeamsPanel({ company }) {
  const api = useApi();
  const modals = useModals();
  const adminStore = useAdminStore();
  const alerts = useSnackbarAlerts();

  const [teams, setTeams] = React.useState([]);
  const [loadingTeams, setLoadingTeams] = React.useState(false);
  const [displayNoAdminWarning, setDisplayNoAdminWarning] = React.useState(
    false
  );

  React.useEffect(async () => {
    setLoadingTeams(true);
    const apiResponse = await api.graphQlQuery(ALL_TEAMS_COMPANY_QUERY, {
      companyId: company.id
    });
    setTeams(apiResponse?.data?.company?.teams);
    setLoadingTeams(false);
  }, [company]);

  React.useEffect(async () => {
    setDisplayNoAdminWarning(teams.some(team => !team.adminUsers?.length > 0));
  }, [teams]);

  async function deleteTeam(team) {
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(DELETE_TEAM_MUTATION, {
        teamId: team.id
      });
      const { teams, employments } = apiResponse?.data?.teams?.deleteTeam;
      setTeams(teams);
      adminStore.dispatch({
        type: ADMIN_ACTIONS.updateTeams,
        payload: { teams, employments }
      });
      alerts.success(`Le groupe '${team.name}' a bien été supprimé.`, "", 6000);
    }, "delete-team");
  }

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
      maxWidth: 150,
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
      maxWidth: 250,
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
      overflowTooltip: true
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
      maxWidth: 150
    },
    {
      label: "Date de création",
      name: "creationTime",
      format: creationTime => formatDay(creationTime, true),
      sortable: true
    }
  ];

  const customActions = team => {
    if (!team) {
      return [];
    }
    const customActions = [
      {
        name: "update",
        label: "Modifier le groupe",
        action: openTeamModal
      },
      {
        name: "delete",
        label: "Supprimer le groupe",
        action: team => {
          modals.open("confirmation", {
            textButtons: true,
            title: "Confirmer suppression",
            handleConfirm: async () => {
              await deleteTeam(team);
            }
          });
        }
      }
    ];
    return customActions;
  };

  function openTeamModal(team) {
    const currentAdmins = adminStore.employments
      .filter(
        e =>
          e.companyId === adminStore.companyId &&
          e.isAcknowledged &&
          e.hasAdminRights &&
          (!e.endDate || e.endDate >= isoFormatLocalDate(new Date()))
      )
      .map(e => e.user);
    const currentUsers = adminStore.employments
      .filter(
        e =>
          e.companyId === adminStore.companyId &&
          e.isAcknowledged &&
          (!e.endDate || e.endDate >= isoFormatLocalDate(new Date()))
      )
      .map(e => ({ ...e.user, detached: "Salarié(s) actif(s)" }));
    const detachedUsers = uniqBy(
      adminStore.employments
        .filter(
          e =>
            e.companyId === adminStore.companyId &&
            e.isAcknowledged &&
            e.endDate &&
            e.endDate < isoFormatLocalDate(new Date())
        )
        .map(e => ({ ...e.user, detached: "Salarié(s) détaché(s)" })),
      "id"
    ).filter(
      detachedUser =>
        !currentUsers.some(currentUser => currentUser.id === detachedUser.id)
    );
    const currentKnownAddresses = adminStore.knownAddresses.filter(
      e => e.companyId === adminStore.companyId
    );
    const currentVehicles = adminStore.vehicles.filter(
      v => v.companyId === adminStore.companyId
    );
    modals.open("companyTeamCreationRevisionModal", {
      team: team,
      company: company,
      selectableUsers: [...currentUsers, ...detachedUsers],
      selectableAdmins: currentAdmins,
      selectableKnownAddresses: currentKnownAddresses,
      selectableVehicles: currentVehicles,
      setTeams: setTeams,
      adminStore: adminStore
    });
  }

  return [
    <Grid key={0} container>
      <Grid item xs={6}>
        <Box className={classes.title}>
          <Typography variant="h4">
            Groupes {!loadingTeams && <span> ({teams?.length || 0})</span>}
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
          Ajouter un nouveau groupe
        </Button>
      </Grid>
    </Grid>,
    loadingTeams && (
      <Skeleton key={2} variant="rectangular" width="100%" height={100} />
    ),
    !loadingTeams && teams?.length === 0 && (
      <Alert key={1} severity="info">
        <Typography>
          Dans cet onglet, vous avez la possibilité de répartir vos salariés
          dans des groupes si leurs temps de travail sont gérés par des
          gestionnaires différents. Les gestionnaires n'auront accès qu'aux
          temps de travail du ou des groupes dont ils sont responsables.
        </Typography>
      </Alert>
    ),
    !loadingTeams && teams?.length > 0 && (
      <Box key={2}>
        {displayNoAdminWarning && (
          <Alert severity="warning" className={classes.warningOneTeamNoAdmin}>
            <Typography gutterBottom>
              Certains groupes n'ont pas de gestionnaire rattaché. Les missions
              des salariés concernés ne peuvent donc pas être validées.
            </Typography>
          </Alert>
        )}
        <AugmentedTable
          key={2}
          columns={teamColumns}
          entries={teams}
          className={classes.vehiclesTable}
          defaultSortBy="name"
          onRowEdit={team => openTeamModal(team)}
          customRowActions={customActions}
        />
      </Box>
    )
  ];
}
