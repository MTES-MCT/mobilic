import { formatActivity } from "common/utils/businessTypes";

export const getBusinessTypesFromGroupedAlerts = groupedAlerts => [
  ...new Set(
    groupedAlerts.reduce(
      (arr, group) =>
        arr.concat(group.alerts.map(alert => formatActivity(alert.business))),
      []
    )
  )
];
