import { ItalicWarningTypography } from "./ItalicWarningTypography";
import { MissionReviewSection } from "../MissionReviewSection";
import { ActivityList } from "../ActivityList";
import React from "react";
import { DAY, isoFormatLocalDate } from "common/utils/time";
import { InfoCard } from "../../../common/InfoCard";
import { DayRegulatoryAlerts } from "../../../regulatory/DayRegulatoryAlerts";
import { HolidayRecap } from "./HolidayRecap";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { useApi } from "common/utils/api";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import {
  DISPUTE_ACTIVITY_MUTATION,
  CANCEL_DISPUTE_MUTATION
} from "common/utils/apiQueries/missions";

const useStyles = makeStyles(() => ({
  disputeNotice: {
    fontWeight: 500,
    fontSize: 14,
    lineHeight: "24px",
    color: fr.colors.decisions.text.default.grey.default,
    textAlign: "left"
  }
}));

// synced with DISPUTE_EXPIRY_DAYS in app/controllers/activity.py
const DISPUTE_DELAY_DAYS = 15;
const DISPUTE_DELAY_SECONDS = DISPUTE_DELAY_DAYS * 24 * 3600;

export function DaySummary({
  isDayEnded,
  activitiesWithNextAndPreviousDay,
  dayStart,
  userId,
  shouldDisplayInitialEmployeeVersion = false,
  missions,
  controlId = null,
  eventsHistory = [],
  hasManagerModifications = false
}) {
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const dayEnd = dayStart + DAY;

  const [disputeUpdates, setDisputeUpdates] = React.useState({});

  const handleDispute = async (activityId, text) => {
    await alerts.withApiErrorHandling(async () => {
      const response = await api.graphQlMutate(DISPUTE_ACTIVITY_MUTATION, {
        activityId,
        text
      });
      const dispute = response.data.activities.disputeActivity.dispute;
      setDisputeUpdates(prev => ({ ...prev, [activityId]: dispute }));
    });
  };

  const handleCancelDispute = async activityId => {
    await alerts.withApiErrorHandling(async () => {
      const response = await api.graphQlMutate(CANCEL_DISPUTE_MUTATION, {
        activityId
      });
      const dispute = response.data.activities.cancelDispute.dispute;
      setDisputeUpdates(prev => ({ ...prev, [activityId]: dispute }));
    });
  };

  const dismissedActivities = React.useMemo(() => {
    const existingIds = new Set(
      activitiesWithNextAndPreviousDay.map(a => a.id).filter(Boolean)
    );
    const userFromActivities = activitiesWithNextAndPreviousDay.find(a => a.user)?.user || null;
    const dismissed = [];
    eventsHistory.forEach(event => {
      if (
        event.type === "DELETE" &&
        event.resourceType === "activity" &&
        !existingIds.has(event.resourceId) &&
        event.before
      ) {
        dismissed.push({
          ...event.before,
          id: event.resourceId,
          dismissedAt: event.time,
          dispute: event.before.dispute || null,
          user: event.before.user || userFromActivities
        });
      }
    });
    return dismissed;
  }, [eventsHistory, activitiesWithNextAndPreviousDay]);

  const activitiesWithDisputeUpdates = React.useMemo(
    () =>
      [...activitiesWithNextAndPreviousDay, ...dismissedActivities]
        .map(a =>
          a.id in disputeUpdates
            ? { ...a, dispute: disputeUpdates[a.id] }
            : a
        )
        .sort((a, b) => (a.startTime || 0) - (b.startTime || 0)),
    [activitiesWithNextAndPreviousDay, dismissedActivities, disputeUpdates]
  );

  const hasWorkMissions = React.useMemo(
    () => missions.filter(mission => !mission.isHoliday).length > 0,
    [missions]
  );

  const now = Math.trunc(Date.now() / 1000);

  const latestAdminValidationTime = React.useMemo(() => {
    const adminValidations = missions
      .flatMap(m => m.validations || [])
      .filter(v => v.isAdmin);
    if (adminValidations.length === 0) return null;
    return Math.max(...adminValidations.map(v => v.receptionTime));
  }, [missions]);

  const validationTimeByMission = React.useMemo(() => {
    const map = new Map();
    missions.forEach(m => {
      const employeeValidations = (m.validations || []).filter(v => !v.isAdmin);
      if (employeeValidations.length > 0) {
        map.set(m.id, Math.max(...employeeValidations.map(v => v.receptionTime)));
      }
    });
    return map;
  }, [missions]);

  const isWithinDisputeDelay =
    latestAdminValidationTime &&
    now - latestAdminValidationTime < DISPUTE_DELAY_SECONDS;

  const isWithinCancelDelay = React.useCallback(
    activity =>
      activity.dispute?.time &&
      now - activity.dispute.time < DISPUTE_DELAY_SECONDS,
    [now]
  );

  const hasActiveDispute = React.useMemo(
    () =>
      activitiesWithDisputeUpdates.some(
        a => a.dispute?.status === "created"
      ),
    [activitiesWithDisputeUpdates]
  );

  return (
    <>
      {hasWorkMissions && (
        <>
          {!controlId && (
            <InfoCard elevation={0} py={0} px={0}>
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
      <InfoCard elevation={0} px={0}>
        <MissionReviewSection
          title="Activités"
          className="no-margin-no-padding"
          titleProps={{ component: "h2" }}
        >
          {!shouldDisplayInitialEmployeeVersion && isWithinDisputeDelay && hasActiveDispute && (
            <p className={classes.disputeNotice}>
              Les modifications effectuées par le gestionnaire ont été
              contestées. Le motif de contestation est modifiable pendant{" "}
              {DISPUTE_DELAY_DAYS} jours.
            </p>
          )}
          {!shouldDisplayInitialEmployeeVersion && isWithinDisputeDelay && hasManagerModifications && !hasActiveDispute && (
            <p className={classes.disputeNotice}>
              Cette journée comporte <strong>des temps de travail modifiés</strong> par
              le gestionnaire. Les modifications sont contestables pendant{" "}
              {DISPUTE_DELAY_DAYS} jours.
            </p>
          )}
          {!shouldDisplayInitialEmployeeVersion && !hasManagerModifications && !hasActiveDispute && (
            <p className={classes.disputeNotice}>
              Il n'y a pas eu de modifications de la part du gestionnaire.
            </p>
          )}
          <ActivityList
            activities={activitiesWithDisputeUpdates}
            fromTime={dayStart}
            untilTime={dayEnd}
            isMissionEnded={isDayEnded}
            eventsHistory={eventsHistory}
            shouldDisplayInitialEmployeeVersion={shouldDisplayInitialEmployeeVersion}
            validationTimeByMission={validationTimeByMission}
            onDispute={isWithinDisputeDelay ? handleDispute : null}
            onCancelDispute={handleCancelDispute}
            isWithinCancelDelay={isWithinCancelDelay}
          />
        </MissionReviewSection>
      </InfoCard>
    </>
  );
}
