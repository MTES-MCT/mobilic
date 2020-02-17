export const EXPENDITURES = {
  day_meal: {
    label: "repas"
  },
  night_meal: {
    label: "repas nuit"
  },
  night_away: {
    label: "découchage"
  },
  snack: {
    label: "casse-croûte"
  }
};

export function parseExpenditureFromBackend(expenditure) {
  return {
    id: expenditure.id,
    type: expenditure.type,
    eventTime: expenditure.eventTime
  };
}
