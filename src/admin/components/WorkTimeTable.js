import React from "react";
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import { formatTimer } from "../../common/utils/time";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { formatPersonName } from "../../common/utils/coworkers";
import { formatExpendituresAsOneString } from "../../common/utils/expenditures";

const useStyles = makeStyles(theme => ({
  root: {
    marginLeft: theme.spacing(2),
    fontSize: "0.75em",
    cursor: "pointer",
    color: ({ sortType }) => (sortType ? theme.palette.primary.main : "inherit")
  }
}));

function TableCellWithSort({ sortType, onSortTypeChange, children }) {
  const classes = useStyles({ sortType });
  return (
    <TableCell>
      <span>{children}</span>
      <span className={classes.root} onClick={onSortTypeChange}>
        {sortType === "asc" ? "▲" : "▼"}
      </span>
    </TableCell>
  );
}

export function WorkTimeTable({ workTimeEntries, users }) {
  const formattedWorkTimeEntries = workTimeEntries.map(wte => ({
    workerName: formatPersonName(users.find(u => u.id === wte.userId)),
    workTime: wte.timers.total_work,
    restTime: wte.timers.break,
    expenditures: wte.expenditures
  }));
  const [sortBy, setSortBy] = React.useState(undefined);
  const [sortType, setSortType] = React.useState(undefined);

  const handleSortTypeChange = column => () => {
    let newSortType = "desc";
    if (sortBy === column && sortType === "desc") newSortType = "asc;";
    setSortBy(column);
    setSortType(newSortType);
  };

  function compare(a, b) {
    if (a < b) return -1;
    if (b < a) return 1;
    return 0;
  }

  const sortedWorkTimeEntries =
    sortBy && sortType
      ? formattedWorkTimeEntries.sort((entry1, entry2) =>
          sortType === "desc"
            ? compare(entry1[sortBy], entry2[sortBy])
            : compare(entry2[sortBy], entry1[sortBy])
        )
      : formattedWorkTimeEntries;

  return (
    <Table className="work-time-table">
      <TableHead>
        <TableRow>
          <TableCellWithSort
            sortType={sortBy === "workerName" ? sortType : undefined}
            onSortTypeChange={handleSortTypeChange("workerName")}
          >
            Employé
          </TableCellWithSort>
          <TableCellWithSort
            sortType={sortBy === "workTime" ? sortType : undefined}
            onSortTypeChange={handleSortTypeChange("workTime")}
          >
            Temps de travail
          </TableCellWithSort>
          <TableCell>Temps de repos</TableCell>
          <TableCell>Frais</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedWorkTimeEntries.map((entry, index) => (
          <TableRow key={index}>
            <TableCell>{entry.workerName}</TableCell>
            <TableCell>{formatTimer(entry.workTime)}</TableCell>
            <TableCell>{formatTimer(entry.restTime)}</TableCell>
            <TableCell style={{ whiteSpace: "pre-line" }}>
              {formatExpendituresAsOneString(entry.expenditures)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
