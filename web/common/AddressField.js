import React from "react";
import TextField from "common/utils/TextField";
import Autocomplete, {
  createFilterOptions
} from "@material-ui/lab/Autocomplete";
import throttle from "lodash/throttle";
import ListItemText from "@material-ui/core/ListItemText";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import * as Sentry from "@sentry/browser";

const filter = createFilterOptions();

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
        Sentry.captureException(err);
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
  allowCreate = true,
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
      freeSolo={allowCreate}
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
        const filtered = filter(options, params);

        // Suggest the creation of a new value
        if (allowCreate && params.inputValue !== "") {
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
        setOptions(newValue ? [newValue, ...options] : options);
        onChange(newValue);
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
      renderOption={option => (
        <ListItemText
          primary={option.manual ? option.label : formatAddressMainText(option)}
          primaryTypographyProps={{ className: "bold" }}
          secondary={formatAddressSubText(option)}
        />
      )}
    />
  );
}
