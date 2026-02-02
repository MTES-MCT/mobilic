import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { MandatorySuffix } from "./forms/MandatorySuffix";
import { GEOPLATEFORME_MAX_RESPONSES } from "./utils/geoplateforme";
import { useGeoplateforme } from "./utils/useGeoplateforme";

const mapMunicipalityResults = (results) => {
  const municipalityMap = new Map();
  
  results.forEach(result => {
    const city = result.names?.[0];
    const postcode = result.zipcode;
    const uniqueKey = postcode || city;
    
    if (city && !municipalityMap.has(uniqueKey)) {
      municipalityMap.set(uniqueKey, {
        name: city,
        label: `${city}${postcode ? ` (${postcode})` : ''}`
      });
    }
  });

  return Array.from(municipalityMap.values());
};

const mapLocationResults = (results, communePostcode = null) => {
  if (!results || !Array.isArray(results)) return [];
  
  const uniqueResults = new Map();
  
  results.forEach((result) => {
    if (communePostcode && result.zipcode !== communePostcode) {
      return;
    }
    
    const name = result.names?.[0] || result.street || result.fulltext || "";
    const isPOI = result.poiType && result.poiType.length > 0;
    const fulltext = result.fulltext || name;
    
    if (!uniqueResults.has(fulltext)) {
      uniqueResults.set(fulltext, {
        type: isPOI ? "poi" : "address",
        name: name,
        label: fulltext,
        fullLabel: fulltext
      });
    }
  });
  
  return Array.from(uniqueResults.values());
};

function GeoplateformeAutocomplete({
  value,
  onChange,
  departmentCode,
  apiParams,
  resultMapper,
  label,
  required = false,
  disabled = false,
  showErrors = false,
  error = false,
  placeholder,
  noOptionsText,
  groupBy = null,
  getOptionLabel,
  searchQueryTransform
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [debouncedInputValue, setDebouncedInputValue] = React.useState("");

  React.useEffect(() => {
    if (value && typeof value === "string") {
      setInputValue(value);
    } else if (!value) {
      setInputValue("");
    }
  }, [value]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedInputValue(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const params = React.useMemo(() => {
    const p = {
      maximumResponses: GEOPLATEFORME_MAX_RESPONSES,
      ...apiParams
    };
    if (departmentCode) {
      p.terr = departmentCode;
    }
    return p;
  }, [departmentCode, JSON.stringify(apiParams)]);

  const searchQuery = React.useMemo(() => {
    return searchQueryTransform ? searchQueryTransform(debouncedInputValue) : debouncedInputValue;
  }, [debouncedInputValue, searchQueryTransform]);

  const { options, loading } = useGeoplateforme({
    endpoint: "completion",
    inputValue: searchQuery,
    params,
    resultMapper: (json) => {
      const results = json.results || [];
      return resultMapper(results);
    },
    dependencies: [departmentCode]
  });

  return (
    <Box mb="1.5rem">
      <Typography
        mb={0.5}
        className={
          (error || (showErrors && required && !value))
            ? "fr-label--error"
            : "fr-label"
        }
      >
        {label} {required && <MandatorySuffix />}
      </Typography>
      <Autocomplete
        freeSolo
        fullWidth
        size="small"
        value={value}
        inputValue={inputValue}
        disabled={disabled}
        loading={loading}
        options={options}
        noOptionsText={noOptionsText}
        loadingText="Chargement..."
        onInputChange={(event, newInputValue) => {
          setInputValue(newInputValue);
          onChange(newInputValue);
        }}
        onChange={(event, newValue) => {
          if (typeof newValue === "string") {
            onChange(newValue);
          } else if (newValue) {
            onChange(newValue.name || newValue.label);
          } else {
            onChange("");
          }
        }}
        getOptionLabel={getOptionLabel}
        groupBy={groupBy}
        renderInput={params => (
          <TextField
            {...params}
            variant="filled"
            hiddenLabel
            error={error || (showErrors && required && !value)}
            placeholder={placeholder}
          />
        )}
      />
    </Box>
  );
}

export function MunicipalityAutocomplete({
  value,
  onChange,
  departmentCode,
  label = "Commune",
  required = false,
  disabled = false,
  showErrors = false,
  error = false
}) {
  const apiParams = React.useMemo(() => ({ 
    type: "PositionOfInterest", 
    poiType: "administratif" 
  }), []);

  const getOptionLabelFn = React.useCallback((option) => {
    if (typeof option === "string") return option;
    return option.label || option.name || "";
  }, []);

  return (
    <GeoplateformeAutocomplete
      value={value}
      onChange={onChange}
      departmentCode={departmentCode}
      apiParams={apiParams}
      resultMapper={mapMunicipalityResults}
      label={label}
      required={required}
      disabled={disabled}
      showErrors={showErrors}
      error={error}
      placeholder="Tapez le nom de la commune"
      noOptionsText="Aucune commune trouvée"
      getOptionLabel={getOptionLabelFn}
    />
  );
}

export function LocationAutocomplete({
  value,
  onChange,
  departmentCode = null,
  commune = null,
  label = "Lieu",
  required = false,
  disabled = false,
  showErrors = false,
  error = false
}) {
  const communePostcode = React.useMemo(() => {
    if (!commune) return null;
    const match = commune.match(/\((\d{5})\)/);
    return match ? match[1] : null;
  }, [commune]);

  const apiParams = React.useMemo(() => {
    const params = { 
      type: "StreetAddress,PositionOfInterest",
      limit: "15"
    };
    if (communePostcode) {
      params.postcode = communePostcode;
    }
    return params;
  }, [communePostcode]);

  const getSearchQuery = React.useCallback((input) => {
    if (!input) return "";
    if (!commune) return input;
    const communeName = commune.replace(/ ?\(\d{5}\)$/, "");
    return `${input} ${communeName}`;
  }, [commune]);

  const getOptionLabelFn = React.useCallback((option) => {
    if (typeof option === "string") return option;
    return option.fullLabel || option.label || option.name || "";
  }, []);

  const groupByFn = React.useCallback((option) => {
    if (typeof option === "string") return undefined;
    return option.type === "PositionOfInterest" ? "Points d'intérêt" : "Adresses";
  }, []);

  return (
    <GeoplateformeAutocomplete
      value={value}
      onChange={onChange}
      departmentCode={departmentCode}
      apiParams={apiParams}
      resultMapper={(results) => mapLocationResults(results, communePostcode)}
      label={label}
      required={required}
      disabled={disabled}
      showErrors={showErrors}
      error={error}
      placeholder="Tapez le nom du lieu"
      noOptionsText="Aucun lieu trouvé"
      getOptionLabel={getOptionLabelFn}
      groupBy={groupByFn}
      searchQueryTransform={getSearchQuery}
    />
  );
}
