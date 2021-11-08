import React from "react";
import {
  formatTimeOfDay,
  formatTimer,
  getStartOfWeek,
  prettyFormatMonth,
  textualPrettyFormatDay,
  textualPrettyFormatWeek
} from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import { AugmentedTable } from "./AugmentedTable";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { isWidthUp } from "@material-ui/core/withWidth";
import { WorkTimeDetails } from "./WorkTimeDetails";
import { ChevronRight } from "@material-ui/icons";
import { SwipeableDrawer } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
  warningText: {
    color: theme.palette.warning.main,
    fontWeight: "bold"
  },
  expenditures: {
    padding: theme.spacing(4)
  },
  workTimeModal: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingRight: theme.spacing(4),
    paddingLeft: theme.spacing(4)
  }
}));

export function WorkTimeTable({
  period,
  workTimeEntries,
  className,
  showExpenditures,
  showMissionName,
  loading,
  width
}) {
  const [workdayOnFocus, setWorkdayOnFocus] = React.useState(null);
  const [wordDayDrawerOpen, setWordDayDrawerOpen] = React.useState(false);

  const classes = useStyles();

  let periodLabel, periodFormatter;
  if (period === "day") {
    periodLabel = "Date";
    periodFormatter = textualPrettyFormatDay;
  } else if (period === "week") {
    periodLabel = "Semaine";
    periodFormatter = ts => textualPrettyFormatWeek(getStartOfWeek(ts));
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
  const pictoCol = {
    label: "+ d'infos",
    name: "id",
    format: () => <ChevronRight color="primary" />,
    sortable: false,
    align: "center",
    overflowTooltip: true
  };

  let columns = [];
  if (period === "day") {
    if (showMissionName) {
      columns = [
        employeeCol,
        missionNamesCol,
        startTimeCol,
        endTimeCol,
        serviceTimeCol,
        workTimeCol,
        restTimeCol
      ];
    } else {
      columns = [
        employeeCol,
        startTimeCol,
        endTimeCol,
        serviceTimeCol,
        workTimeCol,
        restTimeCol
      ];
    }
    if (showExpenditures) columns.push(expenditureCol);
    columns.push(pictoCol);
  } else if (period === "week") {
    columns = [employeeCol, workTimeCol, workedDaysCol];
  } else {
    columns = [employeeCol, workTimeCol, workedDaysCol];
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
    <>
      <SwipeableDrawer
        key={0}
        anchor="right"
        open={!!wordDayDrawerOpen}
        onOpen={() => setWordDayDrawerOpen(true)}
        onClose={() => {
          setWordDayDrawerOpen(false);
        }}
        PaperProps={{
          className: classes.workTimeModal,
          style: {
            minWidth: isWidthUp("md", width) ? 830 : "100vw",
            maxWidth: isWidthUp("md", width) ? 780 : "100vw"
          }
        }}
      >
        <WorkTimeDetails
          key={1}
          workTimeEntry={workdayOnFocus}
          handleClose={() => {
            setWordDayDrawerOpen(false);
          }}
          width={width}
        />
      </SwipeableDrawer>
      <AugmentedTable
        key={2}
        columns={columns}
        entries={preFormattedWorkTimeEntries}
        dense
        virtualizedRowHeight={40}
        defaultSortBy="periodStart"
        defaultSortType="desc"
        className={className}
        virtualized
        onRowClick={entry => {
          if (!entry.day) return false;
          setWorkdayOnFocus(entry);
          setWordDayDrawerOpen(true);
        }}
        groupByColumn={{
          label: periodLabel,
          name: "periodStart",
          sort: "desc",
          height: 60,
          format: periodFormatter,
          minWidth: period === "month" ? 120 : 80,
          overflowTooltip: true
        }}
        loading={loading}
      />
    </>
  );
}
