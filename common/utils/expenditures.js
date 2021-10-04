import map from "lodash/map";
import find from "lodash/find";

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

export function regroupExpendituresSpendingDateByType(expenditures) {
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

export function editUserExpenditures(
  newExpendituresDatesByType,
  oldUserExpenditures,
  missionId,
  createExpenditure,
  cancelExpenditure,
  userId = null
) {
  return Promise.all([
    ...map(newExpendituresDatesByType, (spendingDates, type) => {
      return spendingDates.map(spendingDate => {
        if (
          !oldUserExpenditures.find(
            e => e.type === type && e.spendingDate === spendingDate
          )
        ) {
          return createExpenditure({
            type,
            missionId,
            spendingDate,
            userId
          });
        }
        return Promise.resolve();
      });
    }),
    ...oldUserExpenditures.map(e => {
      if (
        !find(
          newExpendituresDatesByType,
          (spendingDates, type) =>
            type === e.type && spendingDates.includes(e.spendingDate)
        )
      ) {
        return cancelExpenditure({ expenditure: e });
      }
      return Promise.resolve();
    })
  ]);
}
