import React from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { MandatorySuffix } from "./forms/MandatorySuffix";
import {
  GEOPLATEFORME_MAX_RESPONSES,
  isInputSearchable,
  fetchGeoplateforme
} from "./utils/geoplateforme";

/**
 * Generic fetch function for Géoplateforme API completion endpoint
 * @param {string} input - Search query
 * @param {string} departmentCode - Department code to filter results
 * @param {object} apiParams - Additional API parameters (type, poiType, etc.)
 * @param {function} resultMapper - Function to map API results to component options
 * @param {function} callback - Callback function to receive results
 */
const fetchGeoplateforme_Completion = (input, departmentCode, apiParams, resultMapper, callback) => {
  if (!isInputSearchable(input)) {
    callback([]);
    return;
  }

  const queryArgs = new URLSearchParams({
    text: input,
    maximumResponses: GEOPLATEFORME_MAX_RESPONSES,
    ...apiParams
  });

  if (departmentCode) {
    queryArgs.append("terr", departmentCode);
  }

  fetchGeoplateforme(
    "completion",
    queryArgs,
    (results) => callback(resultMapper(results)),
    (json) => json.results || []
  );
};

/**
 * Map API results for municipalities
 */
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

/**
 * Map API results for locations (POI and addresses)
 */
const mapLocationResults = (results) => {
  return results.map(result => {
    const name = result.names?.[0] || result.fulltext;
    const isPOI = result.poiType && result.poiType.length > 0;
    
    return {
      type: isPOI ? "poi" : "address",
      name: name,
      label: result.fulltext || name,
      fullLabel: result.fulltext || name
    };
  });
};

/**
 * Fetch municipalities from Géoplateforme API
 */
const fetchMunicipalities = (input, departmentCode, callback) => {
  fetchGeoplateforme_Completion(
    input,
    departmentCode,
    { type: "PositionOfInterest", poiType: "administratif" },
    mapMunicipalityResults,
    callback
  );
};

/**
 * Fetch locations (POI and addresses) from Géoplateforme API
 */
const fetchLocations = (input, departmentCode, callback) => {
  fetchGeoplateforme_Completion(
    input,
    departmentCode,
    { type: "StreetAddress,PositionOfInterest" },
    mapLocationResults,
    callback
  );
};

/**
 * Generic DSFR Autocomplete Component for Géoplateforme API
 */
function GeoplatefomeAutocomplete({
  value,
  onChange,
  departmentCode,
  fetchFunction,
  label,
  required = false,
  disabled = false,
  showErrors = false,
  error = false,
  placeholder,
  noOptionsText,
  groupBy = null,
  getOptionLabel
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isInputSearchable(inputValue)) {
      setOptions([]);
      return;
    }

    setLoading(true);
    fetchFunction(inputValue, departmentCode, results => {
      setOptions(results);
      setLoading(false);
    });
  }, [inputValue, departmentCode, fetchFunction]);

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

/**
 * Municipality Autocomplete Component - DSFR Style
 */
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
  return (
    <GeoplatefomeAutocomplete
      value={value}
      onChange={onChange}
      departmentCode={departmentCode}
      fetchFunction={fetchMunicipalities}
      label={label}
      required={required}
      disabled={disabled}
      showErrors={showErrors}
      error={error}
      placeholder="Tapez le nom de la commune"
      noOptionsText="Aucune commune trouvée"
      getOptionLabel={option => {
        if (typeof option === "string") return option;
        return option.label || option.name || "";
      }}
    />
  );
}

/**
 * Location Autocomplete Component - DSFR Style (for POI and addresses)
 */
export function LocationAutocomplete({
  value,
  onChange,
  departmentCode = null,
  label = "Lieu",
  required = false,
  disabled = false,
  showErrors = false,
  error = false
}) {
  return (
    <GeoplatefomeAutocomplete
      value={value}
      onChange={onChange}
      departmentCode={departmentCode}
      fetchFunction={fetchLocations}
      label={label}
      required={required}
      disabled={disabled}
      showErrors={showErrors}
      error={error}
      placeholder="Tapez le nom du lieu"
      noOptionsText="Aucun lieu trouvé"
      getOptionLabel={option => {
        if (typeof option === "string") return option;
        return option.fullLabel || option.label || option.name || "";
      }}
      groupBy={option => {
        if (typeof option === "string") return undefined;
        return option.type === "poi" ? "Points d'intérêt" : "Adresses";
      }}
    />
  );
}
