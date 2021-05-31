export const EXPENDITURES = {
  day_meal: {
    label: "repas",
    plural: "repas"
  },
  night_meal: {
    label: `repas${"\u00A0"}nuit`,
    plural: `repas${"\u00A0"}nuit`
  },
  sleep_over: {
    label: "découché",
    plural: "découchés"
  },
  snack: {
    label: "casse-croûte",
    plural: "casse-croûtes"
  }
};

export function parseExpenditureFromBackend(expenditure) {
  return {
    id: expenditure.id,
    type: expenditure.type,
    eventTime: expenditure.eventTime
  };
}

export function formatExpendituresAsOneString(expenditureCounts) {
  return Object.keys(expenditureCounts)
    .filter(type => expenditureCounts[type] > 0)
    .map(
      type =>
        `${expenditureCounts[type]}${"\u00A0"}${
          expenditureCounts[type] > 1
            ? EXPENDITURES[type].plural
            : EXPENDITURES[type].label
        }`
    )
    .sort()
    .join(", ");
}
