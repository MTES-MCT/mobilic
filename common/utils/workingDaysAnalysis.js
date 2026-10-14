import { getDaysBetweenTwoDates, HOUR } from "./time";

// Received at least one hour after it started. Same window as the
// certification real-time criterion. Crossing midnight is not late.
function isActivityLoggedLate(activity) {
  if (!activity.receptionTime || activity.startTime == null) return false;
  return activity.receptionTime - activity.startTime >= HOUR;
}

// Helper: get days modified by an activity (original + current), or empty array
function getModifiedDays(activity) {
  if (!activity.versions?.length) return [];
  const sortedVersions = [...activity.versions].sort(
    (a, b) => a.versionNumber - b.versionNumber
  );
  const firstVersion = sortedVersions[0];
  const hasChanged =
    firstVersion.startTime !== activity.startTime ||
    firstVersion.endTime !== activity.endTime;
  if (!hasChanged) return [];
  return [
    ...getDaysBetweenTwoDates(firstVersion.startTime, firstVersion.endTime),
    ...getDaysBetweenTwoDates(activity.startTime, activity.endTime),
  ];
}

// Analyze working days and detect posteriori additions and modifications
export function analyzeWorkingDays(missions, referenceDate) {
  const allWorkingDays = new Set();
  const daysAddedPosteriori = new Set();
  const daysModified = new Set();
  
  missions.forEach((mission) => {
    mission.allActivities?.forEach((activity) => {
      const activityDays = getDaysBetweenTwoDates(
        activity.startTime,
        activity.endTime
      );
      const loggedLate = isActivityLoggedLate(activity);

      activityDays.forEach((day) => {
        allWorkingDays.add(day);

        if (loggedLate) {
          daysAddedPosteriori.add(day);
        }

        // Check if activity was modified (has versions)
        getModifiedDays(activity).forEach(d => daysModified.add(d));
      });
    });
  });

  return {
    workingDays: allWorkingDays,
    daysAddedPosteriori,
    daysModified,
    workingDaysNumber: allWorkingDays.size,
    daysAddedPosterioriNumber: daysAddedPosteriori.size,
    daysModifiedNumber: daysModified.size
  };
}
