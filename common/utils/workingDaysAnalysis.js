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
        if (activity.versions?.length > 0) {
          const firstVersion = activity.versions[0];
          const hasChanged = 
            firstVersion.startTime !== activity.startTime ||
            firstVersion.endTime !== activity.endTime;

          if (hasChanged) {
            const originalDays = getDaysBetweenTwoDates(
              firstVersion.startTime,
              firstVersion.endTime
            );
            originalDays.forEach(d => daysModified.add(d));
            activityDays.forEach(d => daysModified.add(d));
          }
        }
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

// Get detailed modifications grouped by day
export function getDetailedModificationsByDay(missions) {
  const modificationsByDay = new Map();

  missions.forEach((mission) => {
    const missionAddedLate = isMissionPosteriori(mission);
    
    mission.allActivities?.forEach((activity) => {
      const activityDays = getDaysBetweenTwoDates(
        activity.startTime,
        activity.endTime
      );

      activityDays.forEach((day) => {
        if (!modificationsByDay.has(day)) {
          modificationsByDay.set(day, {
            activities: [],
            hasPosterioriAddition: false,
            hasModification: false,
            modificationsCount: 0
          });
        }

        const dayInfo = modificationsByDay.get(day);
        
        if (missionAddedLate || isActivityAddedLate(activity, day)) {
          dayInfo.hasPosterioriAddition = true;
        }

        if (activity.versions?.length > 0) {
          dayInfo.hasModification = true;
          dayInfo.modificationsCount += activity.versions.length;
        }

        dayInfo.activities.push({
          activityId: activity.id,
          type: activity.type,
          receptionTime: activity.receptionTime,
          versionsCount: activity.versions?.length || 0
        });
      });
    });
  });

  return modificationsByDay;
}
