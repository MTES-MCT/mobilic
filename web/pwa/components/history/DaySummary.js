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
  shouldDisplayInitialEmployeeVersion = false,
  missions,
  controlId = null
}) {
  const dayEnd = dayStart + DAY;
  const infoCardStyles = useInfoCardStyles();

  const hasWorkMissions = React.useMemo(
    () => missions.filter(mission => !mission.isHoliday).length > 0,
    [missions]
  );

  return (
    <>
      {hasWorkMissions && (
        <>
          {!controlId && (
            <InfoCard elevation={0}>
              {isDayEnded && activitiesWithNextAndPreviousDay.length > 0 ? (
                <DayRegulatoryAlerts
                  day={isoFormatLocalDate(dayStart)}
                  userId={userId}
                  shouldDisplayInitialEmployeeVersion={
                    shouldDisplayInitialEmployeeVersion
                  }
                />
              ) : (
                <ItalicWarningTypography>
                  Mission en cours !
                </ItalicWarningTypography>
              )}
            </InfoCard>
          )}
        </>
      )}

      <Grid
        container
        direction="row"
        justifyContent="left"
        alignItems={"baseline"}
        spacing={2}
      >
        {missions
          .filter(m => !!m.isHoliday)
          .map(mission => (
            <HolidayRecap key={mission.id} mission={mission} />
          ))}
      </Grid>
      <InfoCard className={infoCardStyles.topMargin} elevation={0}>
        <MissionReviewSection
          title="Activités de la journée"
          className="no-margin-no-padding"
          titleProps={{ component: "h2" }}
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
