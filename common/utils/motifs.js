export const MOTIF_TECHNICAL_MALFUNCTION = "dysfonctionnement_technique";

export const MOTIFS = [
  { value: "oubli", label: "Oubli" },
  { value: "probleme_telephone", label: "Problème téléphone" },
  { value: MOTIF_TECHNICAL_MALFUNCTION, label: "Dysfonctionnement Mobilic" }
];

export function motifLabel(value) {
  return MOTIFS.find(motif => motif.value === value)?.label || value;
}
