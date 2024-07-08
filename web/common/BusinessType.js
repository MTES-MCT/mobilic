import React from "react";
import { Select } from "@dataesr/react-dsfr";
import { Box, Grid, Typography } from "@mui/material";
import { ExternalLink } from "./ExternalLink";
import { Notice } from "./Notice";
import { useIsWidthDown } from "common/utils/useWidth";

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
    { value: "INFREQUENT", label: "Occasionnel" }
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
            required
            options={transportOptions}
            selected={transportType}
            onChange={e => setTransportType(e.target.value)}
            {...(!transportType && required && showErrors
              ? { messageType: "error" }
              : {})}
            message={
              !transportType && required && showErrors
                ? "Veuillez renseigner un type de transport"
                : ""
            }
          ></Select>
        </Grid>
        <Grid item xs={12} sm={forceColumn ? 6 : 12}>
          <Select
            label="Activité principale"
            required
            options={businessOptions}
            selected={businessType}
            onChange={e => setBusinessType(e.target.value)}
            disabled={!transportType}
            {...(!businessType && required && showErrors
              ? { messageType: "error" }
              : {})}
            message={
              !businessType && required && showErrors
                ? "Veuillez renseigner une activité"
                : ""
            }
          ></Select>
        </Grid>
      </Grid>
      {displayInfo && (
        <Box sx={{ textAlign: "left", marginTop: 2, fontSize: "0.7rem" }}>
          <Notice noBackground noPadding textAlign="left">
            <Typography sx={{ fontSize: "0.7rem" }}>
              Par défaut, l’activité sera attribuée à tous vos salariés. Vous
              aurez ensuite la possibilité de modifier le type d'activité pour
              chaque salarié.
            </Typography>
            <ExternalLink
              url="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/gestionnaire-parametrer-mon-entreprise"
              text="À quoi sert cette information ?"
              withIcon
            />
          </Notice>
        </Box>
      )}
    </div>
  );
}
