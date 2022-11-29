import React, { useMemo } from "react";
import {
  splitByLongBreaksAndComputePeriodStats,
  renderPeriodKpis,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { RegulationCheck } from "../RegulationCheck";
import { checkMinimumDurationOfWeeklyRest } from "common/utils/regulation/rules";
import { MissionReviewSection } from "../MissionReviewSection";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Link from "@mui/material/Link";
import { prettyFormatDay } from "common/utils/time";
import Divider from "@mui/material/Divider";
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { getLatestAlertComputationVersion } from "common/utils/regulation/alertVersions";
import { RegulatoryTextNotCalculatedYet } from "../../../regulatory/RegulatoryText";
import { renderRegulationCheck } from "../../../regulatory/RegulatoryAlertRender";
import { PERIOD_UNITS } from "common/utils/regulation/periodUnitsEnum";

export function Week({
  missionsInPeriod,
  activitiesWithNextAndPreviousDay,
  selectedPeriodStart,
  selectedPeriodEnd,
  handleMissionClick,
  previousPeriodActivityEnd,
  regulationComputationsInPeriod
}) {
  const infoCardStyles = useInfoCardStyles();

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
        {regulationComputation ? (
          regulationComputation.regulationChecks
            ?.filter(
              regulationCheck => regulationCheck.unit === PERIOD_UNITS.WEEK
            )
            .map(regulationCheck => renderRegulationCheck(regulationCheck))
        ) : (
          <RegulatoryTextNotCalculatedYet />
        )}
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
