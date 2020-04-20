import React from "react";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Paper from "@material-ui/core/Paper";
import { PeriodToggle } from "../components/PeriodToggle";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { WorkTimeTable } from "../components/WorkTimeTable";
import Typography from "@material-ui/core/Typography";
import {
  getStartOfWeek,
  prettyFormatDay,
  prettyFormatMonth
} from "common/utils/time";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { useAdminStore } from "../utils/store";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  exportButton: {
    marginLeft: theme.spacing(4)
  },
  filters: {
    marginBottom: theme.spacing(2),
    position: "sticky",
    top: "0",
    zIndex: 500
  },
  tableTitle: {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2)
  },
  activityTables: {
    padding: theme.spacing(2)
  }
}));

export function ActivityPanel() {
  const adminStore = useAdminStore();
  const modals = useModals();

  const [users, setUsers] = React.useState([]);
  const [period, setPeriod] = React.useState("day");
  const [toggleDayDetails, setToggleDayDetails] = React.useState(false);

  React.useEffect(() => {
    const newUsersWithCurrentSelectionStatus = adminStore.users.map(user => {
      const userMatch = users.find(u => u.id === user.id);
      return userMatch ? { ...user, selected: userMatch.selected } : user;
    });
    setUsers(newUsersWithCurrentSelectionStatus);
  }, [adminStore.users]);

  let selectedUsers = users.filter(u => u.selected);
  if (selectedUsers.length === 0) selectedUsers = users;
  const selectedWorkDays = adminStore.workDays.filter(wd =>
    selectedUsers.map(u => u.id).includes(wd.userId)
  );

  // TODO : memoize this
  const periodAggregates = aggregateWorkDayPeriods(selectedWorkDays, period);
  const sortedPeriods = Object.keys(periodAggregates)
    .map(x => parseInt(x))
    .sort((periodStart1, periodStart2) => periodStart2 - periodStart1);

  const classes = useStyles();
  return [
    <Paper className={classes.filters} variant="outlined" key={0}>
      <Box p={2} className="flex-row-space-between">
        <EmployeeFilter users={users} setUsers={setUsers} />
        <Box className="flex-row">
          <PeriodToggle period={period} setPeriod={setPeriod} />
          <Button
            className={classes.exportButton}
            color="primary"
            onClick={() => modals.open("dataExport")}
            variant="contained"
          >
            Export Excel
          </Button>
        </Box>
      </Box>
      {period === "day" && (
        <Box px={2} pb={2} className="flex-row-flex-start">
          <FormControlLabel
            control={
              <Switch
                checked={toggleDayDetails}
                onChange={() => setToggleDayDetails(!toggleDayDetails)}
                color="primary"
              />
            }
            label="Voir détails de la journée"
          />
        </Box>
      )}
    </Paper>,
    <Paper className={classes.activityTables} variant="outlined" key={1}>
      {sortedPeriods.map((periodStart, index) => {
        let periodLabel;
        if (period === "day") {
          periodLabel = prettyFormatDay(periodStart, true);
        } else if (period === "week") {
          periodLabel = `Semaine du ${prettyFormatDay(
            getStartOfWeek(periodStart),
            true
          )}`;
        } else if (period === "month") {
          periodLabel = prettyFormatMonth(periodStart);
        }
        return (
          <Box mb={8} key={index}>
            <Typography
              className={classes.tableTitle}
              variant="h5"
              align="left"
            >
              {periodLabel}
            </Typography>
            <WorkTimeTable
              period={period}
              workTimeEntries={periodAggregates[periodStart]}
              users={adminStore.users}
              displayDetails={toggleDayDetails && period === "day"}
            />
          </Box>
        );
      })}
    </Paper>
  ];
}
