import React, { useState } from "react";
import { Stack } from "@mui/material";
import { MobileDatePicker } from "@mui/x-date-pickers";
import { addDaysToDate } from "common/utils/time";
import { useAdminStore } from "../../store/store";
import { TeamFilter } from "../../components/TeamFilter";

export default function RegulatoryRespectFilters() {

    const adminStore = useAdminStore()
    const [date, setDate] = useState(new Date())
    const minDate = addDaysToDate(new Date(), -365)
    const today = new Date()
    const [teams, setTeams] = React.useState([]);

    React.useEffect(() => {
        const _teams = adminStore.exportFilters.teams
        const adminId = adminStore.userId
        if (!_teams || !adminId) {
            setTeams([])
        }

        const isAdminOfTeams = _teams.filter(t => t.adminUsers.map(a => a.id).includes(adminId))

        const preSelectTeamId = isAdminOfTeams.length === 1 ? isAdminOfTeams[0].id : null

        setTeams(adminStore.exportFilters.teams.map(t => ({
            ...t,
            selected: (preSelectTeamId && t.id === preSelectTeamId)
        })));
    }, [adminStore.exportFilters.teams, adminStore.userId]);

    return <Stack direction="row" mt={2} columnGap={4}>
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
            maxDate={today}
            minDate={minDate}
            renderInput={props => (
                <TextField
                    {...props}
                    required
                    variant="outlined"
                // error={!!dateRangeError}
                // helperText={dateRangeError}
                />
            )}
        />
        {teams?.length > 0 && (
            <TeamFilter teams={teams} setTeams={setTeams} multiple={false} />
        )}
    </Stack>
}