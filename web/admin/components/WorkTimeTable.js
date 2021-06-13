import React from "react";
import {
  formatDay,
  formatTimeOfDay,
  formatTimer,
  getStartOfWeek,
  prettyFormatMonth
} from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import { AugmentedVirtualizedTable } from "./AugmentedTable";
import makeStyles from "@material-ui/core/styles/makeStyles";

const useStyles = makeStyles(theme => ({
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  expenditures: {
    padding: theme.spacing(4)
  }
}));

export function WorkTimeTable({
  period,
  workTimeEntries,
  className,
  showExpenditures
}) {
  const classes = useStyles();

  let periodLabel, periodFormatter;
  if (period === "day") {
    periodLabel = "Date";
    periodFormatter = formatDay;
  } else if (period === "week") {
    periodLabel = "Semaine";
    periodFormatter = ts => formatDay(getStartOfWeek(ts));
  } else if (period === "month") {
    periodLabel = "Mois";
    periodFormatter = prettyFormatMonth;
  }
  const employeeCol = {
    label: "Employé",
    name: "workerName",
    sortable: true,
    align: "left",
    overflowTooltip: true
  };
  const periodCol = {
    label: periodLabel,
    name: "periodStart",
    sortable: true,
    format: periodFormatter,
    align: "left",
    minWidth: period === "month" ? 120 : 80,
    overflowTooltip: true
  };
  const startTimeCol = {
    label: "Début",
    name: "startTime",
    format: time => (time ? formatTimeOfDay(time) : null),
    align: "right",
    minWidth: 80
  };
  const endTimeCol = {
    label: "Fin",
    name: "endTime",
    format: time =>
      time ? (
        formatTimeOfDay(time)
      ) : (
        <span className={classes.warningText}>En cours</span>
      ),
    align: "right",
    minWidth: 80
  };
  const serviceTimeCol = {
    label: "Amplitude",
    name: "service",
    format: formatTimer,
    align: "right",
    minWidth: 100
  };
  const workTimeCol = {
    label: "Temps de travail",
    name: "totalWork",
    sortable: true,
    format: formatTimer,
    align: "right",
    minWidth: 120
  };
  const restTimeCol = {
    label: "Temps de repos",
    name: "rest",
    format: time => (time ? formatTimer(time) : null),
    align: "right",
    minWidth: 100
  };
  const expenditureCol = {
    label: "Frais",
    name: "expenditures",
    format: exps => (exps ? formatExpendituresAsOneString(exps) : null),
    align: "left",
    minWidth: 200,
    overflowTooltip: true,
    className: classes.expenditures
  };
  const workedDaysCol = {
    label: "Jours travaillés",
    name: "workedDays",
    minWidth: 150
  };
  const missionNamesCol = {
    label: "Mission(s)",
    name: "missionNames",
    format: missionNames =>
      missionNames.filter(name => name && name !== "").join(", "),
    align: "left",
    sortable: true,
    overflowTooltip: true
  };
  let columns = [];
  if (period === "day") {
    columns = [
      periodCol,
      employeeCol,
      missionNamesCol,
      startTimeCol,
      endTimeCol,
      serviceTimeCol,
      workTimeCol,
      restTimeCol
    ];
    if (showExpenditures) columns.push(expenditureCol);
  } else if (period === "week") {
    columns = [periodCol, employeeCol, workTimeCol, workedDaysCol];
  } else {
    columns = [periodCol, employeeCol, workTimeCol, workedDaysCol];
  }

  const preFormattedWorkTimeEntries = workTimeEntries.map(wte => {
    const base = {
      ...wte,
      id: wte.user.id + wte.periodStart.toString(),
      workerName: formatPersonName(wte.user),
      selectable: true
    };
    return base;
  });

  return (
    <AugmentedVirtualizedTable
      columns={columns}
      entries={preFormattedWorkTimeEntries}
      dense
      rowHeight={40}
      editable={false}
      defaultSortBy="periodStart"
      defaultSortType="desc"
      className={className}
    />
  );
}
