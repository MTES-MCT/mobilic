import React from "react";
import { Select } from "@dataesr/react-dsfr";

const TRANSPORT_OPTIONS = [
  { value: "TRM", label: "Marchandises (TRM)" },
  { value: "TRV", label: "Voyageurs (TRV)" }
];
const BUSINESS_OPTIONS = {
  TRM: [
    { value: "LONG_DISTANCE", label: "Longue distance" },
    { value: "SHORT_DISTANCE", label: "Courte distance" },
    { value: "SHIPPING", label: "Messagerie, Fonds et valeur" }
  ],
  TRV: [
    { value: "FREQUENT", label: "Lignes régulières" },
    { value: "INFREQUENT", label: "Occasionnels" }
  ]
};

export function BusinessType({
  currentBusiness,
  onChangeBusinessType,
  required = false
}) {
  const [transportType, setTransportType] = React.useState(
    currentBusiness?.transportType || ""
  );
  const [businessType, setBusinessType] = React.useState(
    currentBusiness?.businessType || ""
  );

  const businessOptions = React.useMemo(
    () =>
      transportType
        ? [
            ...(required && !!businessType
              ? []
              : [{ value: "", label: "Sélectionner une activité" }]),
            ...BUSINESS_OPTIONS[transportType]
          ]
        : [],
    [transportType, required, businessType]
  );

  const transportOptions = React.useMemo(
    () => [
      ...(required && !!transportType
        ? []
        : [{ value: "", label: "Sélectionner une catégorie" }]),
      ...TRANSPORT_OPTIONS
    ],
    [required, transportType]
  );

  React.useEffect(() => setBusinessType(""), [transportType]);
  React.useEffect(() => onChangeBusinessType(businessType), [businessType]);

  return (
    <div style={{ textAlign: "left" }}>
      <Select
        label="Type de transport routier"
        required
        options={transportOptions}
        selected={transportType}
        onChange={e => setTransportType(e.target.value)}
        messageType={!transportType && required && "error"}
        message={
          !transportType &&
          required &&
          "Veuillez renseigner un type de transport"
        }
      ></Select>
      <Select
        label="Activité principale"
        required
        options={businessOptions}
        selected={businessType}
        onChange={e => setBusinessType(e.target.value)}
        disabled={!transportType}
        messageType={!businessType && required && "error"}
        message={
          !businessType && required && "Veuillez renseigner une activité"
        }
      ></Select>
    </div>
  );
}
