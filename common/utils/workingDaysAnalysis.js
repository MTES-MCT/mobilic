import { getDaysBetweenTwoDates } from "./time";

// Helper: Check if activity was added after the day it describes
function isActivityAddedLate(activity, dayString) {
  if (!activity.receptionTime) return false;
  
  const dayEnd = new Date(dayString);
  dayEnd.setHours(23, 59, 59, 999);
  
  return new Date(activity.receptionTime) > dayEnd;
}

// Helper: Check if mission was registered as "past registration"
function isMissionPosteriori(mission) {
  if (mission.pastRegistrationJustification) return true;
  
  if (!mission.allActivities?.length) return false;
  
  const missionEndDate = new Date(mission.endTime || Date.now());
  missionEndDate.setHours(23, 59, 59, 999);
  
  return mission.allActivities.every(activity => {
    if (!activity.receptionTime) return false;
    return new Date(activity.receptionTime) > missionEndDate;
  });
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
    const missionAddedLate = isMissionPosteriori(mission);

    mission.allActivities?.forEach((activity) => {
      const activityDays = getDaysBetweenTwoDates(
        activity.startTime,
        activity.endTime
      );

      activityDays.forEach((day) => {
        allWorkingDays.add(day);

        // Check if day was added after it occurred
        if (missionAddedLate || isActivityAddedLate(activity, day)) {
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
