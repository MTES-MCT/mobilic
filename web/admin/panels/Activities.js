import React from "react";
import { EmployeeFilter } from "../components/EmployeeFilter";
import Paper from "@material-ui/core/Paper";
import { PeriodToggle } from "../components/PeriodToggle";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { WorkTimeTable } from "../components/WorkTimeTable";
import { aggregateWorkDayPeriods } from "../utils/workDays";
import { useAdminStore } from "../utils/store";
import { useModals } from "common/utils/modals";
import uniqBy from "lodash/uniqBy";
import uniq from "lodash/uniq";
import min from "lodash/min";
import max from "lodash/max";
import { CompanyFilter } from "../components/CompanyFilter";
import Typography from "@material-ui/core/Typography";
import { formatDay } from "common/utils/time";

const useStyles = makeStyles(theme => ({
  exportButton: {
    marginLeft: theme.spacing(4)
  },
  tableTitle: {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(2)
  },
  container: {
    height: "100%",
    flexGrow: 1
  },
  workTimeTable: {
    overflowY: "hidden",
    flexGrow: 1,
    paddingTop: theme.spacing(1)
  },
  workTimeTableContainer: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1)
  }
}));

export function ActivityPanel() {
  const adminStore = useAdminStore();
  const modals = useModals();

  const [users, setUsers] = React.useState([]);
  const [companies, setCompanies] = React.useState([]);
  const [period, setPeriod] = React.useState("day");

  React.useEffect(() => {
    if (adminStore.companies) {
      const newCompaniesWithCurrentSelectionStatus = adminStore.companies.map(
        company => {
          const companyMatch = companies.find(c => c.id === company.id);
          return companyMatch
            ? { ...company, selected: companyMatch.selected }
            : company;
        }
      );
      setCompanies(newCompaniesWithCurrentSelectionStatus);
    }
  }, [adminStore.companies]);

  let selectedCompanies = companies.filter(c => c.selected);
  if (selectedCompanies.length === 0) selectedCompanies = companies;

  React.useEffect(() => {
    setUsers(
      uniqBy(
        adminStore.users.filter(u =>
          selectedCompanies.map(c => c.id).includes(u.companyId)
        ),
        u => u.id
      )
    );
  }, [companies, adminStore.users]);

  let selectedUsers = users.filter(u => u.selected);
  if (selectedUsers.length === 0) selectedUsers = users;

  const selectedWorkDays = adminStore.workDays.filter(
    wd =>
      selectedUsers.map(u => u.id).includes(wd.user.id) &&
      selectedCompanies.map(c => c.id).includes(wd.companyId)
  );

  // TODO : memoize this
  const periodAggregates = aggregateWorkDayPeriods(selectedWorkDays, period);
  const ref = React.useRef(null);

  const classes = useStyles();
  return [
    <Paper
      className={`scrollable ${classes.container}`}
      variant="outlined"
      key={0}
      ref={ref}
    >
      <Box
        px={2}
        pt={2}
        className="flex-row-space-between"
        style={{ flexWrap: "wrap", flexShrink: 0 }}
      >
        {companies.length > 1 && (
          <CompanyFilter companies={companies} setCompanies={setCompanies} />
        )}
        <EmployeeFilter users={users} setUsers={setUsers} />
        <PeriodToggle period={period} setPeriod={setPeriod} />
        <Button
          className={classes.exportButton}
          color="primary"
          onClick={() => modals.open("dataExport", { companies, users })}
          variant="contained"
        >
          Export Excel
        </Button>
      </Box>
      <Box
        className={`flex-column ${classes.workTimeTableContainer}`}
        style={{ maxHeight: ref.current ? ref.current.clientHeight : 0 }}
      >
        <Typography align="left" variant="h6">
          {periodAggregates.length} résultats{" "}
          {periodAggregates.length > 0 &&
            `pour ${
              uniq(periodAggregates.map(pa => pa.user.id)).length
            } employé(s) entre le ${formatDay(
              min(periodAggregates.map(pa => pa.periodActualStart))
            )} et le ${formatDay(
              max(periodAggregates.map(pa => pa.periodActualEnd))
            )} (uniquement les plus récents).`}
        </Typography>
        <WorkTimeTable
          className={classes.workTimeTable}
          period={period}
          workTimeEntries={periodAggregates}
        />
      </Box>
    </Paper>
  ];
}
