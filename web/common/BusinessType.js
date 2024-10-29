import React from "react";
import { Box, Grid } from "@mui/material";
import { useIsWidthDown } from "common/utils/useWidth";
import { Select } from "./forms/Select";
import Notice from "./Notice";

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
    { value: "INFREQUENT", label: "Occasionnel" },
    { value: "TAXI_GENERAL", label: "Taxi général" },
    { value: "TAXI_REGULATED", label: "Taxi conventionné" },
    { value: "VTC", label: "VTC" },
    { value: "LOTI", label: "LOTI" }
  ]
};

export function BusinessType({
  currentBusiness,
  onChangeBusinessType,
  required = false,
  forceColumn = false,
  showErrors = false,
  displayInfo = false
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

  React.useEffect(() => {
    const currentBusinessType = currentBusiness?.businessType;
    if (!currentBusinessType) {
      setBusinessType("");
    }
    setBusinessType(
      businessOptions.map(o => o.value).includes(currentBusinessType)
        ? currentBusinessType
        : ""
    );
  }, [transportType]);
  React.useEffect(() => onChangeBusinessType(businessType), [businessType]);

  const isSmDown = useIsWidthDown("sm");

  return (
    <div style={{ textAlign: "left" }}>
      <Grid container spacing={isSmDown ? 2 : forceColumn ? 1 : 2}>
        <Grid item xs={12} sm={forceColumn ? 6 : 12}>
          <Select
            label="Type de transport routier"
            nativeSelectProps={{
              onChange: e => setTransportType(e.target.value),
              value: transportType
            }}
            state={
              !transportType && required && showErrors ? "error" : "default"
            }
            stateRelatedMessage={
              !transportType && required && showErrors
                ? "Veuillez compléter ce champ"
                : ""
            }
            required
          >
            {transportOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} sm={forceColumn ? 6 : 12}>
          <Select
            label="Activité principale"
            nativeSelectProps={{
              onChange: e => setBusinessType(e.target.value),
              value: businessType
            }}
            state={
              !businessType && required && showErrors ? "error" : "default"
            }
            stateRelatedMessage={
              !businessType && required && showErrors
                ? "Veuillez compléter ce champ"
                : ""
            }
            required
            disabled={!transportType}
          >
            {businessOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Grid>
      </Grid>
      {displayInfo && (
        <Box sx={{ textAlign: "left", marginTop: 2, fontSize: "0.7rem" }}>
          <Notice
            description={
              <>
                Par défaut, l’activité sera attribuée à tous vos salariés. Vous
                aurez ensuite la possibilité de modifier le type d'activité pour
                chaque salarié.
                <br />
              </>
            }
            linkText="À quoi sert cette information ?"
            linkUrl="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/gestionnaire-parametrer-mon-entreprise"
          />
        </Box>
      )}
    </div>
  );
}
