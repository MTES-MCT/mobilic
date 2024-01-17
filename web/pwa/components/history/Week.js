import React, { useMemo } from "react";
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
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { getLatestAlertComputationVersion } from "common/utils/regulation/alertVersions";
import { WeekRegulatoryAlerts } from "../../../regulatory/WeekRegulatoryAlerts";
import { currentControllerId } from "common/utils/cookie";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";

export function Week({
  missionsInPeriod,
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd,
  handleMissionClick,
  regulationComputationsInPeriod,
  userId
}) {
  const infoCardStyles = useInfoCardStyles();

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

  const regulationComputation = useMemo(
    () => getLatestAlertComputationVersion(regulationComputationsInPeriod),
    [regulationComputationsInPeriod]
  );
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
    let allKpis = renderPeriodKpis(stats).filter(m => m.name !== "service");
    if (hasWorkMissions) {
      return allKpis;
    }
    return allKpis.filter(m => m.name === "offDays");
  }, [hasWorkMissions, stats]);
  return (
    <div>
      {missionsDeleted.length > 0 && (
        <Alert severity="warning" sx={{ marginBottom: 2 }}>
          <Typography>{missionsDeletedWarning}</Typography>
        </Alert>
      )}
      <WorkTimeSummaryKpiGrid metrics={kpis} />
      {hasWorkMissions && (
        <InfoCard className={infoCardStyles.topMargin}>
          <WeekRegulatoryAlerts
            userId={userId}
            day={isoFormatLocalDate(selectedPeriodStart)}
            prefetchedRegulationComputation={
              currentControllerId() ? regulationComputation : null
            }
          />
        </InfoCard>
      )}
      {missionsToDetail.length > 0 && (
        <InfoCard className={infoCardStyles.topMargin}>
          <MissionReviewSection
            title="Détail par mission"
            className="no-margin-no-padding"
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
    </div>
  );
}
