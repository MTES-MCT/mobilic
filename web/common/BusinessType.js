import React from "react";
import { Select } from "@dataesr/react-dsfr";
import { Box, Stack, Typography } from "@mui/material";
import { ExternalLink } from "./ExternalLink";
import { makeStyles } from "@mui/styles";

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

const useStyles = makeStyles(theme => ({
  greyText: {
    color: theme.palette.grey[600]
  }
}));

export function BusinessType({
  currentBusiness,
  onChangeBusinessType,
  required = false,
  forceColumn = false,
  showErrors = false,
  displayInfo = false
}) {
  const classes = useStyles();
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

  return (
    <div style={{ textAlign: "left" }}>
      <Stack
        direction={{ xs: "column", sm: forceColumn ? "column" : "row" }}
        spacing={{ xs: 1, sm: forceColumn ? 1 : 3 }}
      >
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
      </Stack>
      {displayInfo && (
        <Box sx={{ textAlign: "left", marginTop: 2 }}>
          <Typography className={classes.greyText} sx={{ marginBottom: 1 }}>
            Par défaut, l’activité sera attribuée à tous vos salariés. Vous
            aurez ensuite la possibilité de modifier le type d'activité pour
            chaque salarié.
          </Typography>
          <ExternalLink
            url="https://faq.mobilic.beta.gouv.fr/usages-et-fonctionnement-de-mobilic-gestionnaire/gestionnaire-parametrer-mon-entreprise"
            text="À quoi sert cette information ?"
            withIcon
          />
        </Box>
      )}
    </div>
  );
}
