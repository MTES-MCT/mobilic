import { groupBy } from "lodash";
import { PERIOD_UNITS } from "./periodUnitsEnum";

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
