import { getStartOfDay, jsToUnixTimestamp } from "../time";
import { getLatestAlertComputationVersion } from "./alertVersions";
import { PERIOD_UNITS } from "./periodUnitsEnum";

export const getAlertsGroupedByDay = (
  regulationComputationsByDay,
  reportedInfractions
) =>
  regulationComputationsByDay
    ? regulationComputationsByDay.reduce(
        (alertGroups, regulationComputationForDay) => {
          const timestamp = jsToUnixTimestamp(
            new Date(regulationComputationForDay.day).getTime()
          );

          const breachedRegulationChecks = getLatestAlertComputationVersion(
            regulationComputationForDay.regulationComputations
          ).regulationChecks.filter(regulationCheck => !!regulationCheck.alert);
          for (const breachedRegCheck of breachedRegulationChecks) {
            let alertToPush =
              breachedRegCheck.unit === PERIOD_UNITS.WEEK
                ? { week: timestamp }
                : { day: timestamp };
            const extra = JSON.parse(breachedRegCheck.alert.extra);
            alertToPush = {
              ...alertToPush,
              extra,
              checked: reportedInfractions
                .filter(
                  infraction => infraction.sanction === extra?.sanction_code
                )
                .map(infraction => getStartOfDay(infraction.date))
                .includes(getStartOfDay(alertToPush.day || alertToPush.week))
            };
            let checkInArray = alertGroups.find(
              item =>
                item.infringementLabel === breachedRegCheck.label &&
                item.sanction === extra?.sanction_code
            );
            if (checkInArray) {
              checkInArray.alerts.push({ ...alertToPush });
            } else {
              alertGroups.push({
                infringementLabel: breachedRegCheck.label,
                description: breachedRegCheck.description,
                type: breachedRegCheck.type,
                sanction: extra?.sanction_code,
                alerts: [{ ...alertToPush }]
              });
            }
          }
          return alertGroups;
        },
        []
      )
    : [];
