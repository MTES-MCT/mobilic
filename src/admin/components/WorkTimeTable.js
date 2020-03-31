import React from "react";
import { formatTimeOfDay, formatTimer } from "../../common/utils/time";
import { formatPersonName } from "../../common/utils/coworkers";
import { formatExpendituresAsOneString } from "../../common/utils/expenditures";
import { ACTIVITIES } from "../../common/utils/activities";
import { AugmentedTable } from "./AugmentedTable";

export function WorkTimeTable({ workTimeEntries, users, displayDetails }) {
  const columns = displayDetails
    ? [
        { label: "Employé", name: "workerName", sortable: true },
        { label: "Début", name: "startTime", format: formatTimeOfDay },
        { label: "Fin", name: "endTime", format: formatTimeOfDay },
        {
          label: "Temps de travail",
          name: "workTime",
          sortable: true,
          format: formatTimer
        },
        { label: "Temps de repos", name: "restTime", format: formatTimer },
        {
          renderLabel: ACTIVITIES.drive.renderIcon,
          name: "driveTime",
          format: formatTimer
        },
        { label: "Accompagnement", name: "supportTime", format: formatTimer },
        {
          renderLabel: ACTIVITIES.work.renderIcon,
          name: "strictWorkTime",
          format: formatTimer
        },
        {
          label: "Frais",
          name: "expenditures",
          format: formatExpendituresAsOneString,
          cellStyle: { whiteSpace: "pre-line" }
        }
      ]
    : [
        {
          label: "Employé",
          name: "workerName",
          sortable: true,
          editable: true
        },
        {
          label: "Temps de travail",
          name: "workTime",
          sortable: true,
          format: formatTimer
        },
        { label: "Temps de repos", name: "restTime", format: formatTimer },
        {
          label: "Frais",
          name: "expenditures",
          format: formatExpendituresAsOneString,
          cellStyle: { whiteSpace: "pre-line" }
        }
      ];

  const preFormattedWorkTimeEntries = workTimeEntries.map(wte => {
    const base = {
      ...wte,
      id: wte.userId,
      workerName: formatPersonName(users.find(u => u.id === wte.userId)),
      workTime: wte.timers.total_work,
      restTime: wte.timers.break,
      expenditures: wte.expenditures
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
