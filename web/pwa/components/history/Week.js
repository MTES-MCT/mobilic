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

  const atLeastOneMissionDeleted = React.useMemo(
    () => missionsInPeriod.some(mission => mission.isDeleted),
    [missionsInPeriod]
  );

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
  return (
    <div>
      {atLeastOneMissionDeleted && (
        <Alert severity="warning" sx={{ marginBottom: 2 }}>
          <Typography>
            Une ou plusieurs missions de la semaine ont été supprimées.
          </Typography>
        </Alert>
      )}
      <WorkTimeSummaryKpiGrid
        metrics={renderPeriodKpis(stats).filter(m => m.name !== "service")}
      />
      <InfoCard className={infoCardStyles.topMargin}>
        <WeekRegulatoryAlerts
          userId={userId}
          day={isoFormatLocalDate(selectedPeriodStart)}
          prefetchedRegulationComputation={
            currentControllerId() ? regulationComputation : null
          }
        />
      </InfoCard>
      <InfoCard className={infoCardStyles.topMargin}>
        <MissionReviewSection
          title="Détail par mission"
          className="no-margin-no-padding"
        >
          <List>
            {missionsInPeriod.map((mission, index) => [
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
    </div>
  );
}
