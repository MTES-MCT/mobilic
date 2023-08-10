import { REGULATION_RULES } from "../../../web/landing/ResourcePage/RegulationRules";

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
  noPaperLic: "noPaperLic"
};

export const ALERT_TYPE_PROPS_SIMPLER = {
  [ALERT_TYPES.minimumDailyRest]: {
    successMessage: () => "Repos journalier respecté",
    errorMessage: (_, label) => label,
    rule: REGULATION_RULES.dailyRest
  },
  [ALERT_TYPES.maximumWorkDayTime]: {
    successMessage: () => "Durée du travail quotidien respectée",
    errorMessage: (_, label) => label,
    rule: REGULATION_RULES.dailyWork
  },
  [ALERT_TYPES.minimumWorkDayBreak]: {
    successMessage: () => "Temps de pause respecté",
    errorMessage: (_, label) => label,
    rule: REGULATION_RULES.dailyRest
  },
  [ALERT_TYPES.maximumUninterruptedWorkTime]: {
    successMessage: () => "Durée maximale de travail ininterrompu respectée",
    errorMessage: (_, label) => label,
    rule: REGULATION_RULES.dailyRest
  },
  [ALERT_TYPES.maximumWorkedDaysInWeek]: {
    successMessage: () => "Repos hebdomadaire respecté",
    errorMessage: (_, label) => label,
    rule: REGULATION_RULES.weeklyRest
  }
};
