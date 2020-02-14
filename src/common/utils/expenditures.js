import { ACTIVITIES } from "./activities";

export const EXPENDITURES = {
  day_meal: {
    label: "repas"
  },
  night_meal: {
    label: "repas nuit"
  },
  night_away: {
    label: "découchage"
  }
};

export function parseExpenditureFromBackend(expenditure) {
  return {
    id: expenditure.id,
    type: expenditure.type,
    eventTime: expenditure.eventTime,
    companyId: expenditure.companyId
  };
}
