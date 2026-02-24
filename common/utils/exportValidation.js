export function calculateDaysBetween(minDate, maxDate) {
  if (!minDate || !maxDate) return 0;
  const diffTime = Math.abs(maxDate - minDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1;
}

export function validateExportParams({ numUsers, minDate, maxDate }) {
  if (!minDate || !maxDate || numUsers === 0) {
    return {
      message: null,
      canChooseConsolidated: false,
      strategy: null
    };
  }

  const numDays = calculateDaysBetween(minDate, maxDate);

  // Case 1: >= 365 days → 1 file per year per employee
  if (numDays >= 365) {
    return {
      message:
        "La période sélectionnée étant supérieure à 365 jours, le téléchargement sera divisé " +
        "en plusieurs fichiers pour des raisons techniques. Vous recevrez un fichier par " +
        "tranche de 365 jours et par salarié.",
      canChooseConsolidated: false,
      strategy: "over_365_days"
    };
  }

  // Case 2: < 365 days AND > 31 days → 1 file per 100 employees per 31-day period
  if (numDays > 31) {
    // Adapt message based on number of users
    const message =
      numUsers > 100
        ? "Le nombre de salariés sélectionnés étant supérieur à 100 et la période supérieure à 31 jours, " +
          "le téléchargement sera divisé en plusieurs fichiers pour des raisons techniques. " +
          "Vous recevrez un fichier par mois et par tranche de 100 salariés."
        : "La période sélectionnée étant supérieure à 31 jours, " +
          "le téléchargement sera divisé en plusieurs fichiers pour des raisons techniques. " +
          "Vous recevrez un fichier par mois.";
    
    return {
      message: message,
      canChooseConsolidated: false,
      strategy: "over_31_days"
    };
  }

  // Case 3: < 365 days AND < 31 days AND > 100 employees → consolidated file per 100-employee batch
  if (numUsers > 100) {
    return {
      message:
        "Le nombre de salariés sélectionnés étant supérieur à 100, le téléchargement sera divisé " +
        "en plusieurs fichiers pour des raisons techniques. Vous recevrez un fichier par " +
        "tranche de 100 salariés.",
      canChooseConsolidated: false,
      strategy: "over_100_users"
    };
  }

  // Case 4: < 365 days AND < 31 days AND < 100 employees → consolidated OR individual file choice
  return {
    message: null,
    canChooseConsolidated: true,
    strategy: "single_or_consolidated"
  };
}
