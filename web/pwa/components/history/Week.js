import React from "react";
import {
  renderPeriodKpis,
  splitByLongBreaksAndComputePeriodStats,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { MissionReviewSection } from "../MissionReviewSection";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import { isoFormatLocalDate, prettyFormatDay } from "common/utils/time";
import Divider from "@mui/material/Divider";
import { InfoCard } from "../../../common/InfoCard";
import { WeekRegulatoryAlerts } from "../../../regulatory/WeekRegulatoryAlerts";
import { AlertsInHistory } from "../../../control/components/AlertsInHistory";
import Notice from "../../../common/Notice";
import { PeriodHeader } from "./PeriodHeader";
import { Stack } from "@mui/material";

export function Week({
  missionsInPeriod,
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd,
  handleMissionClick,
  userId,
  headingComponent,
  controlId = null,
  alertsInPeriod = null
}) {
  const missionsDeleted = React.useMemo(
    () => missionsInPeriod.filter(mission => mission.isDeleted),
    [missionsInPeriod]
  );
  const missionsDeletedWarning =
    missionsDeleted.length === 1
      ? `La semaine comporte une mission supprimée le ${prettyFormatDay(
          missionsDeleted[0].deletedAt,
          true
        )} par ${missionsDeleted[0].deletedBy}`
      : `La semaine comporte plusieurs missions supprimées`;

  const stats = splitByLongBreaksAndComputePeriodStats(
    activitiesWithNextAndPreviousDay,
    selectedPeriodStart,
    selectedPeriodEnd,
    missionsInPeriod
  );
  const missionsToDetail = React.useMemo(
    () => missionsInPeriod.filter(mission => !mission.isHoliday),
    [missionsInPeriod]
  );

  const hasWorkMissions = React.useMemo(
    () => missionsInPeriod.filter(mission => !mission.isHoliday).length > 0,
    [missionsInPeriod]
  );
  const kpis = React.useMemo(() => {
    let allKpis = renderPeriodKpis(stats).filter(kpi => kpi.name !== "service");
    if (hasWorkMissions) {
      return allKpis;
    }
    return allKpis.filter(kpi => kpi.name === "offDays");
  }, [hasWorkMissions, stats]);
  return (
    <div>
      {alertsInPeriod && alertsInPeriod.length > 0 && (
        <AlertsInHistory alertsInPeriod={alertsInPeriod} />
      )}
      {missionsDeleted.length > 0 && (
        <Notice
          type="warning"
          sx={{ marginBottom: 2, textAlign: "left" }}
          description={missionsDeletedWarning}
        />
      )}
      <PeriodHeader>
        <WorkTimeSummaryKpiGrid metrics={kpis} />
      </PeriodHeader>
      <Stack direction="column" px={2}>
        {hasWorkMissions && !controlId && (
          <InfoCard elevation={0}>
            <WeekRegulatoryAlerts
              userId={userId}
              day={isoFormatLocalDate(selectedPeriodStart)}
            />
          </InfoCard>
        )}
        {missionsToDetail.length > 0 && (
          <InfoCard elevation={0}>
            <MissionReviewSection
              title="Détail par mission"
              className="no-margin-no-padding"
              titleProps={{ component: headingComponent }}
            >
              <List>
                {missionsToDetail.map((mission, index) => [
                  <ListItem
                    key={2 * index}
                    onClick={handleMissionClick(mission.startTime)}
                  >
                    <ListItemText disableTypography>
                      <Link
                        component="button"
                        variant="body1"
                        style={{ textAlign: "justify" }}
                        onClick={e => {
                          e.preventDefault();
                        }}
                      >
                        Mission {mission.name} du{" "}
                        {prettyFormatDay(mission.startTime)}
                        {mission.isDeleted ? " (supprimée)" : ""}
                      </Link>
                    </ListItemText>
                  </ListItem>,
                  index < missionsInPeriod.length - 1 ? (
                    <Divider
                      key={2 * index + 1}
                      component="li"
                      className="hr-unstyled"
                    />
                  ) : null
                ])}
              </List>
            </MissionReviewSection>
          </InfoCard>
        )}
      </Stack>
    </div>
  );
}
