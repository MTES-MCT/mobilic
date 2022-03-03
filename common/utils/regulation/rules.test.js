import { ACTIVITIES } from "../activities";
import { HOUR } from "../time";
import { ALERT_TYPES } from "./alertTypes";
import {
  checkMaximumDurationOfUninterruptedWork,
  checkMaximumDurationOfWork,
  checkMinimumDurationOfBreak,
  isNightWork,
  MAXIMUM_DURATION_OF_DAY_WORK_IN_HOURS,
  MAXIMUM_DURATION_OF_NIGHT_WORK_IN_HOURS,
  MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK,
  RULE_RESPECT_STATUS
} from "./rules";

const getUnixTimestamp = (year, month, day, hours, minutes) => {
  const dateZeroUtc = new Date();
  dateZeroUtc.setFullYear(year);
  dateZeroUtc.setMonth(month);
  dateZeroUtc.setDate(day);
  dateZeroUtc.setHours(hours);
  dateZeroUtc.setMinutes(minutes);
  dateZeroUtc.setSeconds(0);
  dateZeroUtc.setMilliseconds(0);
  const dateUtc = new Date(
    dateZeroUtc.getTime() + dateZeroUtc.getTimezoneOffset() * 60000
  );
  return dateUtc.getTime() / 1000;
};

describe("rules", () => {
  describe("checkMaximumDurationOfUninterruptedWork", () => {
    it("should succeed if activities is empty", () => {
      const activities = [];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.maximumUninterruptedWorkTime);
    });

    it("should fail if drive activity is too long", () => {
      const startTime = getUnixTimestamp(2022, 2, 16, 13, 0);
      const endTime = startTime + MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK + 1;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime,
          endTime
        }
      ];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.maximumUninterruptedWorkTime);
    });

    it("should fail if support activity is too long", () => {
      const startTime = getUnixTimestamp(2022, 2, 16, 13, 0);
      const endTime = startTime + MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK + 1;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.support.name,
          startTime,
          endTime
        }
      ];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.maximumUninterruptedWorkTime);
    });

    it("should fail if work activity is too long", () => {
      const startTime = getUnixTimestamp(2022, 2, 16, 13, 0);
      const endTime = startTime + MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK + 1;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.work.name,
          startTime,
          endTime
        }
      ];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.maximumUninterruptedWorkTime);
    });

    it("should fail if several consecutive activities are too long", () => {
      const halfLimit = MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK / 2;
      const startTime = getUnixTimestamp(2022, 2, 16, 13, 0);
      const endTime1 = startTime + halfLimit;
      const endTime2 = endTime1 + halfLimit + 10;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime,
          endTime: endTime1
        },
        {
          id: 2,
          type: ACTIVITIES.drive.name,
          startTime: endTime1,
          endTime: endTime2
        }
      ];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.maximumUninterruptedWorkTime);
    });

    it("should succeed if we take a break between two long activities.", () => {
      const halfLimit = MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK / 2;
      const startTime1 = getUnixTimestamp(2022, 2, 16, 13, 0);
      const endTime1 = startTime1 + halfLimit;
      const startTime2 = endTime1 + HOUR;
      const endTime2 = startTime2 + halfLimit;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime: startTime1,
          endTime: endTime1
        },
        {
          id: 2,
          type: ACTIVITIES.drive.name,
          startTime: startTime2,
          endTime: endTime2
        }
      ];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.maximumUninterruptedWorkTime);
    });

    it("should succeed even if we do a long transfer", () => {
      const startTime = getUnixTimestamp(2022, 2, 16, 13, 0);
      const endTime = startTime + MAXIMUM_DURATION_OF_UNINTERRUPTED_WORK + 10;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.transfer.name,
          startTime,
          endTime
        }
      ];
      const result = checkMaximumDurationOfUninterruptedWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.maximumUninterruptedWorkTime);
    });
  });

  describe("isNightWork", () => {
    it("should return false if drive is during the day", () => {
      const activitiy = {
        id: 1,
        type: ACTIVITIES.drive.name,
        startTime: getUnixTimestamp(2022, 3, 1, 10, 0),
        endTime: getUnixTimestamp(2022, 3, 1, 11, 0)
      };
      const result = isNightWork(activitiy);
      expect(result).toBe(false);
    });

    it("should return true if drive starts too early", () => {
      const activitiy = {
        id: 1,
        type: ACTIVITIES.drive.name,
        startTime: getUnixTimestamp(2022, 3, 1, 4, 30),
        endTime: getUnixTimestamp(2022, 3, 1, 6, 0)
      };
      const result = isNightWork(activitiy);
      expect(result).toBe(true);
    });

    it("should return true if drive finishes after midnight", () => {
      const activitiy = {
        id: 1,
        type: ACTIVITIES.drive.name,
        startTime: getUnixTimestamp(2022, 3, 1, 20, 0),
        endTime: getUnixTimestamp(2022, 3, 2, 2, 30)
      };
      const result = isNightWork(activitiy);
      expect(result).toBe(true);
    });

    it("should return false if early transfer", () => {
      const activitiy = {
        id: 1,
        type: ACTIVITIES.transfer.name,
        startTime: getUnixTimestamp(2022, 3, 1, 2, 30),
        endTime: getUnixTimestamp(2022, 3, 1, 6, 0)
      };
      const result = isNightWork(activitiy);
      expect(result).toBe(false);
    });
  });

  describe("checkMinimumDurationOfBreak", () => {
    it("should succeed if not much work", () => {
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime: getUnixTimestamp(2022, 3, 1, 10, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 11, 0)
        }
      ];
      const result = checkMinimumDurationOfBreak(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.minimumWorkDayBreak);
    });

    it("should fail if too much work with no break", () => {
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime: getUnixTimestamp(2022, 3, 1, 10, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 14, 0)
        },
        {
          id: 2,
          type: ACTIVITIES.work.name,
          startTime: getUnixTimestamp(2022, 3, 1, 14, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 18, 0)
        }
      ];
      const result = checkMinimumDurationOfBreak(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.minimumWorkDayBreak);
    });

    it("should succeed if lot of work but breaks", () => {
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime: getUnixTimestamp(2022, 3, 1, 10, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 14, 0)
        },
        {
          id: 3,
          type: ACTIVITIES.work.name,
          startTime: getUnixTimestamp(2022, 3, 1, 15, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 19, 0)
        }
      ];
      const result = checkMinimumDurationOfBreak(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.minimumWorkDayBreak);
    });

    it("should succeed even with long transfer", () => {
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.transfer.name,
          startTime: getUnixTimestamp(2022, 3, 1, 6, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 18, 0)
        },
        {
          id: 3,
          type: ACTIVITIES.drive.name,
          startTime: getUnixTimestamp(2022, 3, 1, 18, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 20, 0)
        }
      ];
      const result = checkMinimumDurationOfBreak(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.minimumWorkDayBreak);
    });
  });

  describe("checkMaximumDurationOfWork", () => {
    it("should succeed if not much work", () => {
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime: getUnixTimestamp(2022, 3, 1, 10, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 11, 0)
        }
      ];
      const result = checkMaximumDurationOfWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.maximumWorkDayTime);
    });

    it("should fail if we work more than daily limit", () => {
      const startTime = getUnixTimestamp(2022, 3, 1, 6, 0);
      const endTime = getUnixTimestamp(
        2022,
        3,
        1,
        6 + MAXIMUM_DURATION_OF_DAY_WORK_IN_HOURS * HOUR,
        0
      );
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime,
          endTime
        }
      ];
      const result = checkMaximumDurationOfWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.maximumWorkDayTime);
    });

    it("should fail if we work more than daily nightwork limit", () => {
      const startTime = getUnixTimestamp(2022, 3, 1, 3, 0);
      const endTime =
        startTime + MAXIMUM_DURATION_OF_NIGHT_WORK_IN_HOURS * HOUR + 10;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime,
          endTime
        }
      ];
      const result = checkMaximumDurationOfWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.maximumWorkDayTime);
    });

    it("should fail if we work more than daily limit even with breaks in between", () => {
      const durationEachWorkInHours = Math.ceil(
        MAXIMUM_DURATION_OF_DAY_WORK_IN_HOURS / 3
      );
      const startTime1 = getUnixTimestamp(2022, 3, 1, 6, 0);
      const endTime1 = startTime1 + durationEachWorkInHours * HOUR;
      const startTime2 = endTime1 + HOUR;
      const endTime2 = startTime2 + durationEachWorkInHours * HOUR;
      const startTime3 = endTime2 + HOUR;
      const endTime3 = startTime3 + durationEachWorkInHours * HOUR;
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.drive.name,
          startTime: startTime1,
          endTime: endTime1
        },
        {
          id: 2,
          type: ACTIVITIES.drive.name,
          startTime: startTime2,
          endTime: endTime2
        },
        {
          id: 3,
          type: ACTIVITIES.drive.name,
          startTime: startTime3,
          endTime: endTime3
        }
      ];
      const result = checkMaximumDurationOfWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.failure);
      expect(result.rule).toBe(ALERT_TYPES.maximumWorkDayTime);
    });

    it("should succeed even if long transfer", () => {
      const activities = [
        {
          id: 1,
          type: ACTIVITIES.transfer.name,
          startTime: getUnixTimestamp(2022, 3, 1, 4, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 16, 0)
        },
        {
          id: 2,
          type: ACTIVITIES.drive.name,
          startTime: getUnixTimestamp(2022, 3, 1, 17, 0),
          endTime: getUnixTimestamp(2022, 3, 1, 18, 0)
        }
      ];
      const result = checkMaximumDurationOfWork(activities);
      expect(result.status).toBe(RULE_RESPECT_STATUS.success);
      expect(result.rule).toBe(ALERT_TYPES.maximumWorkDayTime);
    });
  });
});
