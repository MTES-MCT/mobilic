import { RULE_RESPECT_STATUS } from "./rules";
import { formatTimer, HOUR } from "../time";
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
  maximumWorkedDaysInWeek: "maximumWorkedDaysInWeek"
};

export const ALERT_TYPE_PROPS = {
  [ALERT_TYPES.minimumDailyRest]: {
    format: (status, { restDuration }) =>
      `Repos journalier ${
        status === RULE_RESPECT_STATUS.failure
          ? "trop court"
          : status === RULE_RESPECT_STATUS.pending
          ? "en cours"
          : "respecté"
      } ${restDuration ? `(${formatTimer(restDuration)})` : ""} !`,
    infringementLabel: "Non-respect(s) du repos quotidien",
    description:
      "La durée du repos quotidien est d'au-moins 10h toutes les 24h (article R. 3312-53, 2° du code des transports)",
    rule: REGULATION_RULES.dailyRest
  },
  [ALERT_TYPES.maximumWorkDayTime]: {
    format: (status, { nightWork, maximumTimeInHours }) =>
      `Durée du travail ${nightWork ? "de nuit" : "quotidien"} ${
        status === RULE_RESPECT_STATUS.failure ? ">" : "<"
      } ${maximumTimeInHours}h !`,
    infringementLabel:
      "Dépassement(s) de la durée maximale du travail quotidien",
    description:
      "La durée du travail quotidien est limitée à 12h (article R. 3312-a51 du code des transports)",
    rule: REGULATION_RULES.dailyWork
  },
  [ALERT_TYPES.minimumWorkDayBreak]: {
    format: (status, { minimumTimeInMinutes }) =>
      `Temps de pause ${
        status === RULE_RESPECT_STATUS.failure
          ? `< ${minimumTimeInMinutes} mins`
          : "respecté"
      } !`,
    infringementLabel: "Non-respect(s) du temps de pause",
    description:
      "Lorsque le temps de travail dépasse 6h le temps de pause minimal est de 30 minutes (article L3312-2 du code des transports). Lorsque le temps de travail dépasse 9h le temps de pause minimal passe à 45 minutes. Le temps de pause peut être réparti en périodes d'au-moins 15 minutes.",
    rule: REGULATION_RULES.dailyRest
  },
  [ALERT_TYPES.maximumUninterruptedWorkTime]: {
    format: status =>
      status === RULE_RESPECT_STATUS.failure
        ? `Travail ininterrompu pendant plus de 6 heures !`
        : "Durée maximale de travail ininterrompu < 6h !",
    infringementLabel:
      "Dépassement(s) de la durée maximale du travail ininterrompu",
    description:
      "Lorsque le temps de travail dépasse 6h il doit être interrompu par un temps de pause (article L3312-2 du code des transports)",
    rule: REGULATION_RULES.dailyRest
  },
  [ALERT_TYPES.maximumWorkedDaysInWeek]: {
    format: (status, { restDuration, tooManyDays }) =>
      tooManyDays
        ? "7 jours travaillés dans la semaine !"
        : `Repos hebdomadaire ${
            status === RULE_RESPECT_STATUS.failure ? "trop court" : "respecté"
          } ${
            restDuration
              ? `(${
                  restDuration > 48 * HOUR ? "> 34h" : formatTimer(restDuration)
                })`
              : ""
          } !`,
    infringementLabel: "Non-respect(s) du repos hebdomadaire",
    description:
      "Il est interdit de travailler plus de six jours dans la semaine (article L. 3132-1 du code du travail). Le repos hebdomadaire doit durer au minimum 34h (article L. 3132-2 du code du travail)",
    rule: REGULATION_RULES.weeklyRest
  }
};
