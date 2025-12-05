import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { addDaysToDate, lastMonth } from "common/utils/time";
import { useAdminStore } from "../../store/store";
import { TeamFilter } from "../../components/TeamFilter";
import { EmployeeFilter } from "../../components/EmployeeFilter";
import { useRegulatoryAlertsSummaryContext } from "../../utils/contextRegulatoryAlertsSummary";

export default function RegulatoryRespectFilters() {
  const adminStore = useAdminStore();
  const { date, setDate, onSelectUniqueUserId, onSelectTeamId } =
    useRegulatoryAlertsSummaryContext();
  const minDate = addDaysToDate(new Date(), -365);
  const maxDate = lastMonth();
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  React.useEffect(() => {
    const _teams = adminStore.exportFilters.teams;
    const adminId = adminStore.userId;
    if (!_teams || !adminId) {
      setTeams([]);
    }

    const isAdminOfTeams = _teams.filter((t) =>
      t.adminUsers.map((a) => a.id).includes(adminId)
    );

    const preSelectTeamId =
      isAdminOfTeams.length === 1 ? isAdminOfTeams[0].id : null;

    setTeams(
      adminStore.exportFilters.teams.map((t) => ({
        ...t,
        selected: preSelectTeamId && t.id === preSelectTeamId
      }))
    );
  }, [adminStore.exportFilters.teams, adminStore.userId]);

  useEffect(() => {
    // no teams, all users are selectable
    if (teams.length === 0) {
      setUsers(adminStore.users);
      return;
    }

    let selectedTeams = [];
    // no team is selected
    if (teams.every((t) => !t.selected)) {
      selectedTeams = teams;
    } else {
      selectedTeams = teams.filter((t) => t.selected);
    }

    //filter to keep only teams where current admin is an admin
    selectedTeams = selectedTeams.filter((t) =>
      t.adminUsers.map((ad) => ad.id).includes(adminStore.userId)
    );

    // extract unique userIds from selected teams
    const selectedTeamsUserIds = [
      ...new Set(selectedTeams.flatMap((team) => team.users).map((u) => u.id))
    ];
    setUsers(
      adminStore.users.filter((u) => selectedTeamsUserIds.includes(u.id))
    );
  }, [adminStore.users, teams]);

  useEffect(() => {
    const selectedUsers = users.filter((u) => u.selected);
    if (selectedUsers.length === 1) {
      onSelectUniqueUserId(selectedUsers[0].id);
    } else {
      onSelectUniqueUserId(null);
      const selectedTeams = teams.filter((t) => t.selected);
      if (selectedTeams.length === 1) {
        onSelectTeamId(selectedTeams[0].id);
      } else if (selectedTeams.length === 0) {
        onSelectTeamId(null);
      }
    }
  }, [users, teams]);

  return (
    <Stack direction="row" mt={2} columnGap={4}>
      <MobileDatePicker
        label="Mois"
        value={date}
        inputFormat="MMMM yyyy"
        fullWidth
        onChange={setDate}
        openTo={"month"}
        views={["year", "month"]}
        cancelText={null}
        disableCloseOnSelect={false}
        disableMaskedInput={true}
        maxDate={maxDate}
        minDate={minDate}
        renderInput={(props) => (
          <TextField {...props} required variant="outlined" />
        )}
      />
      {teams?.length > 0 && (
        <TeamFilter
          teams={teams}
          setTeams={setTeams}
          multiple={false}
          size="medium"
          sx={{ minWidth: "250px" }}
        />
      )}
      <EmployeeFilter
        users={users}
        multiple={false}
        size="medium"
        sx={{ minWidth: "250px" }}
        uniqueEmptyLabel="Tous les salariés"
        setUsers={setUsers}
      />
    </Stack>
  );
}
