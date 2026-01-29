import React from "react";
import TextField from "common/utils/TextField";
import ListItemText from "@mui/material/ListItemText";
import Autocomplete from "@mui/material/Autocomplete";
import {
  formatAddressMainText,
  formatAddressSubText,
  formatKey
} from "common/utils/addresses";
import { makeStyles } from "@mui/styles";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Notice from "./Notice";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { isInputSearchable } from "./utils/geoplateforme";
import { useGeoplateforme, useGeoplateforme_Reverse } from "./utils/useGeoplateforme";

const useStyles = makeStyles(theme => ({
  geolocationButton: {
    marginLeft: theme.spacing(3)
  }
}));

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
  const [open, setOpen] = React.useState(false);

  const { options: searchOptions, loading: searchLoading } = useGeoplateforme({
    endpoint: "search",
    inputValue,
    params: {},
    resultMapper: (json) => json.features || [],
    enabled: isInputSearchable(inputValue)
  });

  const { options: reverseOptions, loading: reverseLoading } = useGeoplateforme_Reverse({
    position: currentPosition,
    resultMapper: (json) => json.features || [],
    enabled: !!currentPosition && !isInputSearchable(inputValue)
  });

  const options = React.useMemo(() => {
    if (inputValue === "" && !currentPosition) {
      return value ? [value] : detaultOptions();
    }
    if (!isInputSearchable(inputValue)) {
      return reverseOptions.concat(detaultOptions());
    }
    return searchOptions;
  }, [inputValue, currentPosition, searchOptions, reverseOptions, value, defaultAddresses]);

  const loading = searchLoading || reverseLoading;

  const classes = useStyles();

  return (
    <Autocomplete
      id="address-field"
      freeSolo
      fullWidth={fullWidth}
      groupBy={
        isInputSearchable(inputValue)
          ? null
          : option => option.default ? "Adresses enregistrées" : "Adresses proches"
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
                  onClick={() => {
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
