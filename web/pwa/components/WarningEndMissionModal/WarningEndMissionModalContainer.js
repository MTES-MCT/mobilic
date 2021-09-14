import React from "react";
import { getCurrentActivityDuration } from "common/utils/events";
import { formatWarningDurationTime } from "common/utils/time";
import { ACTIVITIES } from "common/utils/activities";
import { useModals } from "common/utils/modals";

export default function WarningEndMissionModalContainer({
  openEndMissionModal,
  currentMission,
  currentTeam,
  latestActivity,
  activityDuration
}) {
  const ACTIVITY_DURATION_WARNING_THRESHOLD = 36000;

  const [
    latestActivityIdDurationWarningDismiss,
    setLatestActivityIdDurationWarningDismiss
  ] = React.useState(0);

  const modals = useModals();

  React.useEffect(() => {
    const label = latestActivity.endTime
      ? ACTIVITIES.break.label
      : ACTIVITIES[latestActivity.type]?.label;

    const dismissWarning = () => {
      setLatestActivityIdDurationWarningDismiss(latestActivity.id);
    };
    if (
      latestActivityIdDurationWarningDismiss !== latestActivity.id &&
      getCurrentActivityDuration(latestActivity) >
        ACTIVITY_DURATION_WARNING_THRESHOLD
    ) {
      modals.open("warningEndMissionModal", {
        dismissModal: dismissWarning,
        activityDuration: formatWarningDurationTime(activityDuration),
        activityLabel: label,
        handleMissionEnd: () => {
          openEndMissionModal({
            mission: currentMission,
            team: currentTeam,
            latestActivityStartTime: latestActivity.startTime
          });
        }
      });
    }
  }, [latestActivity, activityDuration]);

  return null;
}
