import { jsToUnixTimestamp } from "../time";
import { getLatestAlertComputationVersion } from "./alertVersions";
import { PERIOD_UNITS } from "./periodUnitsEnum";

export const getAlertsGroupedByDay = regulationComputations =>
  regulationComputations
    ? regulationComputations.reduce((arr, item) => {
        const timestamp = jsToUnixTimestamp(new Date(item.day).getTime());

        const breachedRegulationChecks = getLatestAlertComputationVersion(
          item.regulationComputations
        ).regulationChecks.filter(regulationCheck => !!regulationCheck.alert);
        for (const breachedRegCheck of breachedRegulationChecks) {
          const alertToPush =
            breachedRegCheck.unit === PERIOD_UNITS.WEEK
              ? { week: timestamp }
              : { day: timestamp };
          const extra = JSON.parse(breachedRegCheck.alert.extra);
          let checkInArray = arr.find(
            item =>
              item.infringementLabel === breachedRegCheck.label &&
              item.sanction === extra?.sanction_code
          );
          if (checkInArray) {
            checkInArray.alerts.push({ ...alertToPush, extra });
          } else {
            arr.push({
              infringementLabel: breachedRegCheck.label,
              description: breachedRegCheck.description,
              type: breachedRegCheck.type,
              sanction: extra?.sanction_code,
              alerts: [{ ...alertToPush, extra }]
            });
          }
        }
        return arr;
      }, [])
    : [];
