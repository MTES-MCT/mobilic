import {
  renderPeriodKpis,
  splitByLongBreaksAndComputePeriodStats,
  WorkTimeSummaryKpiGrid
} from "../WorkTimeSummary";
import { ItalicWarningTypography } from "./ItalicWarningTypography";
import { MissionReviewSection } from "../MissionReviewSection";
import { ActivityList } from "../ActivityList";
import React from "react";
import { DAY, isoFormatLocalDate } from "common/utils/time";
import { InfoCard, useInfoCardStyles } from "../../../common/InfoCard";
import { DayRegulatoryAlerts } from "../../../regulatory/DayRegulatoryAlerts";
import { HolidayRecap } from "./HolidayRecap";
import Grid from "@mui/material/Grid";

export function DaySummary({
  isDayEnded,
  activitiesWithNextAndPreviousDay,
  dayStart,
  userId,
  loading = false,
  shouldDisplayInitialEmployeeVersion = false,
  prefetchedRegulationComputation = null,
  missions
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
        metrics={renderPeriodKpis(stats, true)
          .filter(m => m.name !== "workedDays")
          .filter(m => m.name !== "offDays")}
      />
      <InfoCard className={infoCardStyles.topMargin}>
        {isDayEnded && activitiesWithNextAndPreviousDay.length > 0 ? (
          <DayRegulatoryAlerts
            day={isoFormatLocalDate(dayStart)}
            userId={userId}
            shouldDisplayInitialEmployeeVersion={
              shouldDisplayInitialEmployeeVersion
            }
            prefetchedRegulationComputation={prefetchedRegulationComputation}
          />
        ) : (
          <ItalicWarningTypography>Mission en cours !</ItalicWarningTypography>
        )}
      </InfoCard>
      <Grid
        container
        direction="row"
        justifyContent="left"
        alignItems={"baseline"}
        spacing={2}
        my={2}
      >
        {missions
          .filter(m => !!m.isHoliday)
          .map(mission => (
            <HolidayRecap key={mission.id} mission={mission} />
          ))}
      </Grid>
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
