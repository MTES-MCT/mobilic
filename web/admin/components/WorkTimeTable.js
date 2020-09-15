import React from "react";
import Tooltip from "@material-ui/core/Tooltip";
import { formatTimeOfDay, formatTimer } from "common/utils/time";
import { formatPersonName } from "common/utils/coworkers";
import { formatExpendituresAsOneString } from "common/utils/expenditures";
import { ACTIVITIES } from "common/utils/activities";
import { AugmentedTable } from "./AugmentedTable";

export function WorkTimeTable({
  period,
  workTimeEntries,
  users,
  displayDetails
}) {
  const employeeCol = { label: "Employé", name: "workerName", sortable: true };
  const startTimeCol = {
    label: "Début",
    name: "startTime",
    format: time => (time ? formatTimeOfDay(time) : null)
  };
  const endTimeCol = { label: "Fin", name: "endTime", format: formatTimeOfDay };
  const workTimeCol = {
    label: "Temps de travail",
    name: "workTime",
    sortable: true,
    format: formatTimer
  };
  const restTimeCol = {
    label: "Temps de repos",
    name: "restTime",
    format: formatTimer
  };
  const driveTimeCol = {
    renderLabel: ACTIVITIES.drive.renderIcon,
    name: "driveTime",
    format: formatTimer
  };
  const supportTimeCol = {
    label: "Accompagnement",
    name: "supportTime",
    format: formatTimer
  };
  const strictWorkTimeCol = {
    renderLabel: ACTIVITIES.work.renderIcon,
    name: "strictWorkTime",
    format: formatTimer
  };
  const expenditureCol = {
    label: "Frais",
    name: "expenditures",
    format: exps => (exps ? formatExpendituresAsOneString(exps) : null),
    cellStyle: { whiteSpace: "pre-line" }
  };
  const hasModificationsCol = {
    label: "",
    name: "wasModified",
    format: wasModified =>
      wasModified ? (
        <Tooltip
          title="Cette journée a été modifiée après la saisie initiale"
          placement="top"
          style={{ cursor: "default" }}
        >
          <span>⚠️</span>
        </Tooltip>
      ) : (
        ""
      )
  };
  const workedDaysCol = {
    label: "Jours travaillés",
    name: "workedDays"
  };
  let columns = [];
  if (period === "day" && displayDetails) {
    columns = [
      employeeCol,
      startTimeCol,
      endTimeCol,
      workTimeCol,
      restTimeCol,
      driveTimeCol,
      supportTimeCol,
      strictWorkTimeCol,
      expenditureCol,
      hasModificationsCol
    ];
  } else if (period === "day") {
    columns = [
      employeeCol,
      workTimeCol,
      restTimeCol,
      expenditureCol,
      hasModificationsCol
    ];
  } else {
    columns = [employeeCol, workTimeCol, workedDaysCol, expenditureCol];
  }

  const preFormattedWorkTimeEntries = workTimeEntries.map(wte => {
    const base = {
      ...wte,
      id: wte.userId,
      workerName: formatPersonName(users.find(u => u.id === wte.userId)),
      workTime: wte.timers.total_work,
      restTime: wte.timers.break + (wte.timers.rest || 0)
    };
    if (displayDetails) {
      base.driveTime = wte.activityTimers[ACTIVITIES.drive.name];
      base.supportTime = wte.activityTimers["support"];
      base.strictWorkTime = wte.activityTimers[ACTIVITIES.work.name];
    }
    return base;
  });

  return (
    <AugmentedTable
      columns={columns}
      entries={preFormattedWorkTimeEntries}
      editable={false}
    />
  );
}
