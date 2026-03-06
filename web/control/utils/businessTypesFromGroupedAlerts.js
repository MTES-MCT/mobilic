import { formatActivity } from "common/utils/businessTypes";

export const getBusinessTypesFromGroupedAlerts = groupedAlerts => {
  if (!groupedAlerts || groupedAlerts.length === 0) return [];
  
  const seen = new Set();
  const result = [];
  
  for (const group of groupedAlerts) {
    if (!group.alerts) continue;
    
    for (const alert of group.alerts) {
      if (!alert.business) continue;
      
      const formatted = formatActivity(alert.business);
      if (!seen.has(formatted)) {
        seen.add(formatted);
        result.push(formatted);
      }
    }
  }
  
  return result;
};
