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
    ...expenditure
  };
}

function computeExpenditureLabel(expenditureType, expCount) {
  switch (expCount) {
    case 0:
      return EXPENDITURES[expenditureType].label;
    case 1:
      return `1 ${EXPENDITURES[expenditureType].label}`;
    default:
      return `${expCount} ${EXPENDITURES[expenditureType].plural}`;
  }
}

export function formatExpendituresAsOneString(expenditureCounts) {
  return Object.keys(expenditureCounts)
    .filter(type => expenditureCounts[type] > 0)
    .map(type => computeExpenditureLabel(type, expenditureCounts[type]))
    .sort()
    .join(", ");
}

export function regroupExpendituresBySpendingDate(expenditures) {
  const expendituresReducer = (expObject, expenditure) => {
    if (expenditure.type in expObject) {
      if (!expObject[expenditure.type].includes(expenditure.spendingDate)) {
        expObject[expenditure.type].push(expenditure.spendingDate);
      }
    } else {
      expObject[expenditure.type] = [expenditure.spendingDate];
    }
    return expObject;
  };
  return expenditures.reduce(expendituresReducer, {});
}
