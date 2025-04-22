import React from "react";
import { InfoCard } from "../../common/InfoCard";
import { MissionReviewSection } from "../../pwa/components/MissionReviewSection";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { AlertCard } from "./Alerts/AlertGroup";
import { WarningComputedAlerts } from "./UserReadAlerts";
import { sanctionComparator } from "../utils/sanctionComparator";

export function AlertsInHistory({ alertsInPeriod }) {
  return (
    <InfoCard sx={{ marginBottom: 2 }} elevation={0}>
      <MissionReviewSection
        title="Infractions calculées par Mobilic"
        titleProps={{ component: "h2", marginBottom: 1 }}
      >
        <WarningComputedAlerts />
        <List>
          {alertsInPeriod.sort(sanctionComparator).map(alert => (
            <ListItem key={`alert__${alert.type}`} sx={{ paddingX: 0 }}>
              <AlertCard alert={alert} />
            </ListItem>
          ))}
        </List>
      </MissionReviewSection>
    </InfoCard>
  );
}
