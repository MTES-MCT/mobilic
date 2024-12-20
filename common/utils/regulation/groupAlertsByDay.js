import { groupBy } from "lodash";
import { PERIOD_UNITS } from "./periodUnitsEnum";
import { getLatestAlertComputationVersion } from "./alertVersions";
import { jsToUnixTimestamp } from "../time";

export const getAlertsGroupedByDay = observedInfractions => {
  if (!observedInfractions) {
    return [];
  }
  const infractionsGroupedByLabel = groupBy(
    observedInfractions,
    infraction => infraction.label
  );
  return Object.entries(infractionsGroupedByLabel).map(
    ([label, infractions]) => {
      const firstInfraction = infractions[0];
      const { sanction, type, unit } = firstInfraction;
      return {
        alerts: infractions.map(
          ({
            date,
            isReportable,
            isReported,
            extra,
            business,
            description
          }) => ({
            ...(unit === PERIOD_UNITS.DAY && { day: date }),
            ...(unit === PERIOD_UNITS.WEEK && { week: date }),
            unit,
            checked: isReported,
            reportable: isReportable,
            extra,
            business,
            description
          })
        ),
        infringementLabel: label,
        type,
        sanction
      };
    }
  );
};

export const getAlertsGroupedByDayFromRegulationComputationsByDay = regulationComputationsByDay =>
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
            const extra = JSON.parse(breachedRegCheck.alert.extra);
            const alertToPush = {
              ...(breachedRegCheck.unit === PERIOD_UNITS.WEEK && {
                week: timestamp
              }),
              ...(breachedRegCheck.unit === PERIOD_UNITS.DAY && {
                day: timestamp
              }),
              unit: breachedRegCheck.unit,
              extra,
              checked: false
            };
            let checkInArray = alertGroups.find(
              item =>
                item.infringementLabel === breachedRegCheck.label &&
                item.sanction === extra?.sanction_code
            );
            if (checkInArray) {
              checkInArray.alerts.push(alertToPush);
            } else {
              alertGroups.push({
                infringementLabel: breachedRegCheck.label,
                description: breachedRegCheck.description,
                type: breachedRegCheck.type,
                sanction: extra?.sanction_code,
                alerts: [alertToPush]
              });
            }
          }
          return alertGroups;
        },
        []
      )
    : [];
