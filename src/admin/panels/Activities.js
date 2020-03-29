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
} from "../../common/utils/time";
import { useStoreSyncedWithLocalStorage } from "../../common/utils/store";
import { loadCompanyData } from "../utils/loadCompanyData";
import { useApi } from "../../common/utils/api";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

const useStyles = makeStyles(theme => ({
  exportButton: {
    marginLeft: theme.spacing(4)
  },
  filters: {
    marginBottom: theme.spacing(2)
  },
  tableTitle: {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2)
  }
}));

export function ActivityPanel() {
  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
  const companyId = storeSyncedWithLocalStorage.userInfo().companyId;

  const [rawUsers, setRawUsers] = React.useState([]);
  const [period, setPeriod] = React.useState("day");
  const [toggleDayDetails, setToggleDayDetails] = React.useState(false);

  const [users, setUsers] = React.useState([]);

  const [rawWorkDays, setRawWorkDays] = React.useState([]);

  async function loadData() {
    try {
      const company = await loadCompanyData(api, companyId);
      setRawUsers(company.users);
      setRawWorkDays(company.workDays);
    } catch (err) {
      console.log(err);
    }
  }

  React.useEffect(() => {
    loadData();
    setInterval(loadData, 5 * 60 * 1000);
  }, []);

  React.useEffect(() => {
    const newUsersWithCurrentSelectionStatus = rawUsers.map(user => {
      const userMatch = users.find(u => u.id === user.id);
      return userMatch ? { ...user, selected: userMatch.selected } : user;
    });
    setUsers(newUsersWithCurrentSelectionStatus);
  }, [rawUsers]);

  let selectedUsers = users.filter(u => u.selected);
  if (selectedUsers.length === 0) selectedUsers = users;
  const selectedWorkDays = rawWorkDays.filter(wd =>
    selectedUsers.map(u => u.id).includes(wd.userId)
  );

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
            onClick={e => console.log(e)}
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
    <Paper variant="outlined" key={1}>
      <Box m={2}>
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
                workTimeEntries={periodAggregates[periodStart]}
                users={rawUsers}
                displayDetails={toggleDayDetails && period === "day"}
              />
            </Box>
          );
        })}
      </Box>
    </Paper>
  ];
}
