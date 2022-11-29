import { jsToUnixTimestamp } from "../time";
import { getLatestAlertComputationVersion } from "./alertVersions";

export const getAlertsGroupedByDay = regulationComputations =>
  regulationComputations
    ? regulationComputations.reduce((arr, item) => {
        const timestamp = jsToUnixTimestamp(new Date(item.day).getTime());

        const breachedRegulationChecks = getLatestAlertComputationVersion(
          item.regulationComputations
        ).regulationChecks.filter(regulationCheck => !!regulationCheck.alert);
        for (const breachedRegCheck of breachedRegulationChecks) {
          let checkInArray = arr.find(
            item => item.infringementLabel === breachedRegCheck.label
          );
          if (checkInArray) {
            checkInArray.alerts.push({ day: timestamp });
          } else {
            arr.push({
              infringementLabel: breachedRegCheck.label,
              description: breachedRegCheck.description,
              alerts: [{ day: timestamp }]
            });
          }
        }
        return arr;
      }, [])
    : [];
