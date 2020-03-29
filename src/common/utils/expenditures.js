export const EXPENDITURES = {
  day_meal: {
    label: "repas"
  },
  night_meal: {
    label: `repas${"\u00A0"}nuit`
  },
  sleep_over: {
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

export function formatExpendituresAsOneString(expenditureCounts) {
  return Object.keys(expenditureCounts)
    .map(
      type =>
        `${EXPENDITURES[type].label}${"\u00A0"}:${"\u00A0"}${
          expenditureCounts[type]
        }`
    )
    .sort()
    .join("\n");
}
