import React from "react";
import {
  splitByLongBreaksAndComputePeriodStats,
  renderPeriodKpis,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { RegulationCheck } from "../RegulationCheck";
import { checkMinimumDurationOfWeeklyRest } from "common/utils/regulation/rules";
import { MissionReviewSection } from "../MissionReviewSection";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText/ListItemText";
import Link from "@material-ui/core/Link";
import { prettyFormatDay } from "common/utils/time";
import Divider from "@material-ui/core/Divider";
import { InfoCard, useInfoCardStyles } from "../InfoCard";

export function Week({
  missionsInPeriod,
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd,
  handleMissionClick,
  previousPeriodActivityEnd
}) {
  const infoCardStyles = useInfoCardStyles();

  const stats = splitByLongBreaksAndComputePeriodStats(
    activitiesWithNextAndPreviousDay,
    selectedPeriodStart,
    selectedPeriodEnd,
    missionsInPeriod
  );
  return (
    <div>
      <WorkTimeSummaryKpiGrid
        metrics={renderPeriodKpis(stats).filter(m => m.name !== "service")}
      />
      <InfoCard className={infoCardStyles.topMargin}>
        <RegulationCheck
          check={checkMinimumDurationOfWeeklyRest(
            stats.workedDays,
            stats.innerLongBreaks,
            stats.startTime,
            previousPeriodActivityEnd
          )}
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
                  </Link>
                </ListItemText>
              </ListItem>,
              index < missionsInPeriod.length - 1 ? (
                <Divider key={2 * index + 1} component="li" />
              ) : null
            ])}
          </List>
        </MissionReviewSection>
      </InfoCard>
    </div>
  );
}
