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
      const { sanction, type, description, unit } = firstInfraction;
      return {
        alerts: infractions.map(
          ({ date, isReportable, isReported, extra }) => ({
            ...(unit === PERIOD_UNITS.DAY && { day: date }),
            ...(unit === PERIOD_UNITS.WEEK && { week: date }),
            checked: isReported,
            reportable: isReportable,
            extra
          })
        ),
        infringementLabel: label,
        type,
        description,
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
