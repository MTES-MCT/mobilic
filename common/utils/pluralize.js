export function pluralizeEntrepriseLabel(label, companiesCount) {
  if (label.toLowerCase().includes("entreprise") && companiesCount > 1) {
    return `${label}s`;
  }
  return label;
}
