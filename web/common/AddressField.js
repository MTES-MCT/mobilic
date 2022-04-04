import React from "react";
import TextField from "common/utils/TextField";
import throttle from "lodash/throttle";
import ListItemText from "@mui/material/ListItemText";
import Autocomplete from "@mui/material/Autocomplete";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import { captureSentryException } from "common/utils/sentry";

const fetchPlaces = throttle((input, currentPosition = null, callback) => {
  let queryArgs = new URLSearchParams();
  if (input && input !== "") queryArgs.append("q", input);
  if (currentPosition && currentPosition.coords) {
    queryArgs.append("lat", currentPosition.coords.latitude);
    queryArgs.append("lon", currentPosition.coords.longitude);
  }

  fetch(
    `https://api-adresse.data.gouv.fr/${
      !input && currentPosition ? "reverse" : "search"
    }/?${queryArgs.toString()}`
  )
    .then(
      response => response.json(),
      err => {
        captureSentryException(err);
        return null;
      }
    )
    .then(json => (json ? json.features || [] : null))
    .then(places => (places ? callback(places) : null));
}, 300);

export function AddressField({
  value,
  onChange,
  fullWidth,
  defaultAddresses,
  variant,
  label,
  currentPosition,
  required,
  disabled = false,
  small = false
}) {
  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);

    if (inputValue === "" && !currentPosition) {
      setOptions(value ? [value] : []);
      setLoading(false);
      return undefined;
    }

    fetchPlaces(inputValue, currentPosition, results => {
      setOptions(results);
      setLoading(false);
    });
  }, [value, inputValue, currentPosition]);

  const isSearchingAddress = inputValue && inputValue !== "";

  const _options = isSearchingAddress
    ? options
    : [
        ...options,
        ...(defaultAddresses || []).map(a => ({ ...a, default: true }))
      ];

  return (
    <Autocomplete
      id="address-field"
      freeSolo
      fullWidth={fullWidth}
      groupBy={
        isSearchingAddress
          ? null
          : option =>
              option.default ? "Adresses enregistrées" : "Adresses proches"
      }
      getOptionLabel={option =>
        typeof option === "string" ? option : formatAddressMainText(option)
      }
      disabled={disabled}
      selectOnFocus
      options={_options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      clearOnBlur
      blurOnSelect
      value={value}
      size={small ? "small" : "medium"}
      filterOptions={(options, params) => {
        const filtered = [...options];

        // Suggest the creation of a new value
        if (params.inputValue !== "") {
          filtered.push({
            manual: true,
            name: params.inputValue,
            label: (
              <span>
                Définir nouvelle adresse
                <span style={{ fontWeight: "normal" }}>
                  "{params.inputValue}"
                </span>
              </span>
            )
          });
        }

        return filtered;
      }}
      onChange={(event, newValue) => {
        let cleanNewValue = newValue;
        if (typeof newValue === "string") {
          cleanNewValue = { manual: true, name: newValue };
        }
        setOptions(options =>
          cleanNewValue ? [cleanNewValue, ...options] : options
        );
        onChange(cleanNewValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={params => (
        <TextField
          {...params}
          required={required}
          variant={variant}
          label={label}
          fullWidth
        />
      )}
      disableListWrap
      loading={loading}
      noOptionsText="Pas de résultats"
      loadingText="Chargement..."
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      renderOption={(props, option) => (
        <ListItemText
          {...props}
          primary={option.manual ? option.label : formatAddressMainText(option)}
          primaryTypographyProps={{ className: "bold" }}
          secondary={formatAddressSubText(option)}
        />
      )}
    />
  );
}
