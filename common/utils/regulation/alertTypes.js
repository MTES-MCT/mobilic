import { PRETTY_LABELS } from "../../../web/admin/panels/RegulatoryRespect/RegulatoryRespectAlertsRecap";
import { REGULATION_RULES } from "../../../web/landing/ResourcePage/RegulationRules";
import { formatMinutesFromSeconds, HOUR, MINUTE } from "../time";

export const SubmitterType = {
  EMPLOYEE: "employee",
  ADMIN: "admin"
};

export const ALERT_TYPES = {
  minimumDailyRest: "minimumDailyRest",
  maximumWorkDayTime: "maximumWorkDayTime",
  minimumWorkDayBreak: "minimumWorkDayBreak",
  maximumUninterruptedWorkTime: "maximumUninterruptedWorkTime",
  maximumWorkedDaysInWeek: "maximumWorkedDaysInWeek",
  noPaperLic: "noLic",
  maximumWorkInCalendarWeek: "maximumWorkInCalendarWeek",
  enoughBreak: "enoughBreak"
};

export const ALERT_TYPE_PROPS_SIMPLER = {
  [ALERT_TYPES.minimumDailyRest]: {
    rule: REGULATION_RULES.dailyRest,
    title: PRETTY_LABELS.minimumDailyRest,
    getTag: (extra) => {
      const { min_daily_break_in_hours } = extra;
      return `inférieur à ${formatMinutesFromSeconds(min_daily_break_in_hours * HOUR)}`;
    }
  },
  [ALERT_TYPES.maximumWorkDayTime]: {
    rule: REGULATION_RULES.dailyWork,
    title: PRETTY_LABELS.maximumWorkDayTime,
    getTag: (extra) => {
      const { max_work_range_in_hours, work_range_in_seconds } = extra;
      const diff = work_range_in_seconds - max_work_range_in_hours * HOUR;
      return `dépassée de ${formatMinutesFromSeconds(diff)}`;
    }
  },
  [ALERT_TYPES.minimumWorkDayBreak]: {
    rule: REGULATION_RULES.dailyRest,
    title: PRETTY_LABELS.not_enough_break,
    getTag: (extra) => {
      const { min_break_time_in_minutes } = extra;
      return `inférieur à ${formatMinutesFromSeconds(min_break_time_in_minutes * MINUTE)}`;
    }
  },
  [ALERT_TYPES.maximumUninterruptedWorkTime]: {
    rule: REGULATION_RULES.dailyRest,
    title: PRETTY_LABELS.too_much_uninterrupted_work_time,
    getTag: (extra) => {
      {
        const {
          max_uninterrupted_work_in_hours,
          longest_uninterrupted_work_in_seconds
        } = extra;

        const diff =
          longest_uninterrupted_work_in_seconds -
          max_uninterrupted_work_in_hours * HOUR;
        return `dépassée de ${formatMinutesFromSeconds(diff)}`;
      }
    }
  },
  [ALERT_TYPES.maximumWorkedDaysInWeek]: {
    rule: REGULATION_RULES.weeklyRest,
    title: PRETTY_LABELS.maximumWorkedDaysInWeek,
    getTag: (extra) => {
      return "";
    }
  },
  [ALERT_TYPES.maximumWorkInCalendarWeek]: {
    rule: REGULATION_RULES.weeklyWork,
    title: PRETTY_LABELS.maximumWorkInCalendarWeek,
    getTag: (extra) => {
      return "";
    }
  },
  [ALERT_TYPES.enoughBreak]: {
    rule: REGULATION_RULES.dailyRest
  }
};
