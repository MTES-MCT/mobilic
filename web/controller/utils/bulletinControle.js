export const DEFAULT_BC_NO_LIC = {
  firstName: "",
  lastName: "",
  nationality: "fr",
  touched: false
};

export const NATIONALITIES = [
  { value: "", label: "" },
  { value: "fr", label: "France" },
  { value: "en", label: "Angleterre" }
];

export const CONTROL_BULLETIN_TRANSPORT_TYPE = {
  INTERIEUR: { label: "Intérieur", apiValue: "interieur" },
  INTERNATIONAL: { label: "International", apiValue: "international" },
  CABOTAGE: { label: "Cabotage", apiValue: "cabotage" }
};
