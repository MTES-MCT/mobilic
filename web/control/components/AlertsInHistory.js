import React from "react";
import { MissionReviewSection } from "../../pwa/components/MissionReviewSection";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { AlertCard } from "./Alerts/AlertGroup";
import { WarningComputedAlerts } from "./UserReadAlerts";
import { sanctionComparator } from "../utils/sanctionComparator";

export function AlertsInHistory({ alertsInPeriod }) {
  const sortedAlerts = React.useMemo(
    () => [...alertsInPeriod].sort(sanctionComparator),
    [alertsInPeriod]
  );

  return (
    <MissionReviewSection
      title="Infractions calculées par Mobilic"
      titleProps={{ component: "h2", marginBottom: 1 }}
      className="no-margin-no-padding"
    >
      <WarningComputedAlerts />
      <List>
        {sortedAlerts.map(alert => (
          <ListItem key={`alert__${alert.type}`} sx={{ paddingX: 0 }}>
            <AlertCard alert={alert} />
          </ListItem>
        ))}
      </List>
    </MissionReviewSection>
  );
}
