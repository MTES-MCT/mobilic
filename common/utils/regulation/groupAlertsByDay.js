import { getStartOfDay, jsToUnixTimestamp } from "../time";
import { getLatestAlertComputationVersion } from "./alertVersions";
import { PERIOD_UNITS } from "./periodUnitsEnum";

export const getAlertsGroupedByDay = (
  regulationComputations,
  reportedInfractions
) =>
  regulationComputations
    ? regulationComputations.reduce((arr, item) => {
        const timestamp = jsToUnixTimestamp(new Date(item.day).getTime());

        const breachedRegulationChecks = getLatestAlertComputationVersion(
          item.regulationComputations
        ).regulationChecks.filter(regulationCheck => !!regulationCheck.alert);
        for (const breachedRegCheck of breachedRegulationChecks) {
          let alertToPush =
            breachedRegCheck.unit === PERIOD_UNITS.WEEK
              ? { week: timestamp }
              : { day: timestamp };
          const extra = JSON.parse(breachedRegCheck.alert.extra);
          alertToPush.extra = extra;
          alertToPush.checked = reportedInfractions
            .filter(infraction => infraction.sanction === extra?.sanction_code)
            .map(infraction => getStartOfDay(infraction.date))
            .includes(getStartOfDay(alertToPush.day || alertToPush.week));
          let checkInArray = arr.find(
            item =>
              item.infringementLabel === breachedRegCheck.label &&
              item.sanction === extra?.sanction_code
          );
          if (checkInArray) {
            checkInArray.alerts.push({ ...alertToPush });
          } else {
            arr.push({
              infringementLabel: breachedRegCheck.label,
              description: breachedRegCheck.description,
              type: breachedRegCheck.type,
              sanction: extra?.sanction_code,
              alerts: [{ ...alertToPush }]
            });
          }
        }
        return arr;
      }, [])
    : [];
