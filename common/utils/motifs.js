export const MOTIF_TECHNICAL_MALFUNCTION = "dysfonctionnement_technique";

export const MOTIFS = [
  { value: "oubli", key: "OUBLI", label: "Oubli" },
  {
    value: "probleme_telephone",
    key: "PHONE_ISSUE",
    label: "Problème téléphone"
  },
  {
    value: MOTIF_TECHNICAL_MALFUNCTION,
    key: "TECHNICAL_MALFUNCTION",
    label: "Dysfonctionnements techniques"
  }
];

export function motifLabel(value) {
  return MOTIFS.find(motif => motif.value === value)?.label || value;
}
