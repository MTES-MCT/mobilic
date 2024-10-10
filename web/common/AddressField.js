import React from "react";
import TextField from "common/utils/TextField";
import throttle from "lodash/throttle";
import ListItemText from "@mui/material/ListItemText";
import Autocomplete from "@mui/material/Autocomplete";
import {
  formatAddressMainText,
  formatAddressSubText,
  formatKey
} from "common/utils/addresses";
import { captureSentryException } from "common/utils/sentry";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Notice from "./Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
  geolocationButton: {
    marginLeft: theme.spacing(3)
  }
}));

const API_ADRESSE_MIN_SEARCHABLE_CHARACTER = 3;
const isInputSearchable = input =>
  input?.trim()?.length >= API_ADRESSE_MIN_SEARCHABLE_CHARACTER;

const fetchPlaces = throttle((input, currentPosition = null, callback) => {
  let queryArgs = new URLSearchParams();
  if (isInputSearchable(input)) queryArgs.append("q", input);
  if (currentPosition && currentPosition.coords) {
    queryArgs.append("lat", currentPosition.coords.latitude);
    queryArgs.append("lon", currentPosition.coords.longitude);
  }

  if (Array.from(queryArgs).length > 0) {
    fetch(
      `https://api-adresse.data.gouv.fr/${
        !isInputSearchable(input) && currentPosition ? "reverse" : "search"
      }/?${queryArgs.toString()}`
    )
      .then(
        response => response.json(),
        err => {
          captureSentryException(err);
          return null;
        }
      )
      .then(json => (json ? json.features || [] : []))
      .then(places => (places ? callback(places) : callback([])));
  } else {
    callback([]);
  }
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
  small = false,
  askCurrentPosition = () => {},
  disableGeolocation = true
}) {
  const detaultOptions = () => {
    const companyAddresses = [
      ...(defaultAddresses || []).map(a => ({ ...a, default: true }))
    ];
    if (!disableGeolocation && !currentPosition) {
      companyAddresses.unshift({ activateLocation: true, default: false });
    }
    return companyAddresses;
  };

  const [inputValue, setInputValue] = React.useState("");
  const [options, setOptions] = React.useState(detaultOptions());
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (inputValue === "" && !currentPosition) {
      setOptions(value ? [value] : detaultOptions());
    } else {
      setLoading(true);
      fetchPlaces(inputValue, currentPosition, results => {
        if (!isInputSearchable(inputValue)) {
          setOptions(results?.concat(detaultOptions()));
        } else {
          setOptions(results);
        }
        setLoading(false);
      });
    }
  }, [value, inputValue, currentPosition, defaultAddresses]);

  const classes = useStyles();

  return (
    <Autocomplete
      id="address-field"
      freeSolo
      fullWidth={fullWidth}
      groupBy={
        isInputSearchable(inputValue)
          ? null
          : option =>
              option.default ? "Adresses enregistrées" : "Adresses proches"
      }
      getOptionLabel={option =>
        typeof option === "string"
          ? option
          : formatAddressMainText(option) || ""
      }
      disabled={disabled}
      selectOnFocus
      options={options}
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
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderOption={(props, option) =>
        option.activateLocation ? (
          <Box key={"activateLocation"}>
            {!loading ? (
              <>
                <Button
                  iconId="fr-icon-map-pin-2-line"
                  iconPosition="left"
                  priority="secondary"
                  className={classes.geolocationButton}
                  onClick={e => {
                    setLoading(true);
                    askCurrentPosition();
                  }}
                >
                  Utiliser ma position actuelle
                </Button>
                <Notice
                  description="Vos déplacements ne seront pas géolocalisés"
                  size="small"
                  sx={{ marginTop: 1, marginX: 3 }}
                />
              </>
            ) : (
              <CircularProgress
                color="inherit"
                size={20}
                className={classes.geolocationButton}
              />
            )}
          </Box>
        ) : (
          <li {...props} key={formatKey(option)}>
            <ListItemText
              primary={
                option.manual ? option.label : formatAddressMainText(option)
              }
              primaryTypographyProps={{ className: "bold" }}
              secondary={formatAddressSubText(option)}
            />
          </li>
        )
      }
    />
  );
}
