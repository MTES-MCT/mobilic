import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { frenchFormatDateStringOrTimeStamp } from "common/utils/time";
import { BusinessDropdown } from "../../components/BusinessDropdown";
import { AdminRightsDropdown } from "../../components/AdminRightsDropdown";
import { TeamDropdown } from "../../components/TeamDropdown";
import EmployeeStatusBadge from "./EmployeeStatusBadge";

const isUserOnlyAdminOfTeams = (teams, userId) => {
  return teams
    .filter(
      (team) =>
        team.adminUsers?.length === 1 && team.adminUsers[0].id === userId
    )
    .map((team) => team.name);
};

export const confirmActionIfOnlyAdmin = (
  modals,
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

export const getPendingEmploymentColumns = ({ teams, allowTemporaryEmployees }) => {
  const formatTeam = (teamId) =>
    teams?.find((team) => team.id === teamId)?.name;

  const columns = [
    {
      label: "Identifiant ou email",
      name: "idOrEmail",
      sortable: true,
      minWidth: 260,
      baseWidth: 300,
      overflowTooltip: true,
      align: "left",
      format: (idOrEmail, entry) =>
        entry.isExpired ? (
          <>
            <EmployeeStatusBadge isExpired />
            {idOrEmail}
          </>
        ) : (
          idOrEmail
        )
    },
    {
      label: "Accès gestionnaire",
      name: "hasAdminRights",
      minWidth: 120,
      baseWidth: 120,
      align: "left",
      format: (hasAdminRights) => (hasAdminRights ? "Oui" : "Non")
    }
  ];

  if (allowTemporaryEmployees) {
    columns.push({
      label: "Fin rattachement",
      name: "endDate",
      align: "center",
      format: (endDate) =>
        endDate ? frenchFormatDateStringOrTimeStamp(endDate) : "",
      minWidth: 120,
      baseWidth: 140
    });
  }

  columns.push(
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
  );

  if (teams?.length > 0) {
    columns.push({
      label: "Groupe d'affectation",
      name: "teamId",
      minWidth: 160,
      baseWidth: 160,
      align: "left",
      format: formatTeam
    });
  }

  columns.push({
    label: "",
    name: "remindButton",
    minWidth: 140,
    baseWidth: 140,
    format: (remindButton) => remindButton
  });

  columns.push({
    label: "",
    name: "cancelButton",
    minWidth: 120,
    baseWidth: 120,
    format: (cancelButton) => cancelButton
  });

  return columns;
};

export const getValidEmploymentColumns = ({
  adminStore,
  companyId,
  modals,
  handleReattachSuccess,
  handleBatchTerminateSuccess,
  allowTemporaryEmployees,
  temporary = false,
  handleUpdateEndDate
}) => {
  const columns = [
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
    }
  ];

  if (temporary) {
    columns.push({
      label: "Fin rattachement",
      name: "endDate",
      align: "left",
      sortable: true,
      minWidth: 160,
      baseWidth: 180,
      format: (endDate, entry) => {
        if (!endDate) return "";
        return (
          <>
            {frenchFormatDateStringOrTimeStamp(endDate)}
            {!entry.isDetached && (
              <Button
                priority="tertiary no outline"
                size="small"
                onClick={() => handleUpdateEndDate(entry)}
              >
                Modifier
              </Button>
            )}
          </>
        );
      }
    });
  } else {
    columns.push({
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
    });
  }

  if (adminStore?.teams?.length > 0) {
    columns.push({
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

  columns.push({
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

  if (!temporary) {
    columns.push({
      label: "Identifiant",
      name: "id",
      align: "left",
      minWidth: 120,
      baseWidth: 120
    });
  }

  columns.push({
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
              allowTemporaryEmployees,
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
              modals,
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

  return columns;
};
