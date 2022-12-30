import {
  renderPeriodKpis,
  splitByLongBreaksAndComputePeriodStats,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { DayRegulationInfo } from "../../../common/DayRegulationInfo";
import { ItalicWarningTypography } from "./ItalicWarningTypography";
import { MissionReviewSection } from "../MissionReviewSection";
import { ActivityList } from "../ActivityList";
import React from "react";
import { DAY } from "common/utils/time";
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { DayRegulatoryAlerts } from "../../../regulatory/DayRegulatoryAlerts";

export function DaySummary({
  isDayEnded,
  activitiesWithNextAndPreviousDay,
  weekActivities,
  dayStart,
  regulationComputation,
  loading = false
}) {
  const dayEnd = dayStart + DAY;
  const infoCardStyles = useInfoCardStyles();

  const stats = splitByLongBreaksAndComputePeriodStats(
    activitiesWithNextAndPreviousDay,
    dayStart,
    dayEnd
  );

  return (
    <>
      <WorkTimeSummaryKpiGrid
        loading={loading}
        metrics={renderPeriodKpis(stats, true).filter(
          m => m.name !== "workedDays"
        )}
      />
      <InfoCard loading={loading} className={infoCardStyles.topMargin}>
        {isDayEnded && activitiesWithNextAndPreviousDay.length > 0 ? (
          <DayRegulationInfo
            activitiesOverCurrentPastAndNextDay={
              activitiesWithNextAndPreviousDay
            }
            dayStart={dayStart}
            weekActivities={weekActivities}
          />
        ) : (
          <ItalicWarningTypography>Mission en cours !</ItalicWarningTypography>
        )}
      </InfoCard>
      {process.env.REACT_APP_SHOW_BACKEND_REGULATION_COMPUTATIONS === "1" && (
        <InfoCard loading={loading} className={infoCardStyles.topMargin}>
          <DayRegulatoryAlerts regulationComputation={regulationComputation} />
        </InfoCard>
      )}
      <InfoCard className={infoCardStyles.topMargin}>
        <MissionReviewSection
          title="Activités de la journée"
          className="no-margin-no-padding"
        >
          <ActivityList
            activities={activitiesWithNextAndPreviousDay}
            fromTime={dayStart}
            untilTime={dayEnd}
            isMissionEnded={isDayEnded}
          />
        </MissionReviewSection>
      </InfoCard>
    </>
  );
}
