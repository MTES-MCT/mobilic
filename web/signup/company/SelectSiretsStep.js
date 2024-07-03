import Button from "@mui/material/Button";
import React, { useMemo, useCallback } from "react";
import { Step } from "./Step";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import { FacilityInfo } from "./FacilityInfo";
import AlreadyRegisteredSirets from "./AlreadyRegisteredSirets";
import Stack from "@mui/material/Stack";
import { PhoneNumber } from "../../common/PhoneNumber";
import { BusinessType } from "../../common/BusinessType";
import { TextInput } from "@dataesr/react-dsfr";

const useStyles = makeStyles(theme => ({
  button: {
    marginTop: theme.spacing(2)
  },
  noSirenText: {
    display: "block",
    fontStyle: "italic",
    paddingTop: theme.spacing(6)
  },
  verticalFormButton: {
    marginTop: theme.spacing(4)
  },
  radioButton: {
    textAlign: "left",
    marginBottom: theme.spacing(2)
  },
  siretName: {
    minWidth: 350,
    maxWidth: 500,
    marginBottom: theme.spacing(2)
  }
}));

export function SelectSiretsStep({ facilities, setFacilities, ...props }) {
  const [hasValidatedChoice, setHasValidatedChoice] = React.useState(false);
  const classes = useStyles();

  const updateFacility = useCallback(
    (facility, field, newValue) =>
      setFacilities(
        facilities.map(f =>
          f.siret === facility.siret ? { ...f, [field]: newValue } : f
        )
      ),
    [facilities, setFacilities]
  );

  const selectedSirets = useMemo(() => facilities.filter(f => f.selected), [
    facilities
  ]);
  const areFacilitiesCorrectlySet = useMemo(() => {
    if (selectedSirets.length === 0) {
      return false;
    }
    const selectedNames = selectedSirets.map(f => f.usualName);

    // no value should be empty
    if (selectedNames.filter(Boolean).length < selectedNames.length) {
      return false;
    }

    const selectedBusinessTypes = selectedSirets.map(f => f.businessType);

    // no value should be empty
    if (
      selectedBusinessTypes.filter(Boolean).length <
      selectedBusinessTypes.length
    ) {
      return false;
    }

    // values should be unique
    return [...new Set(selectedNames)].length === selectedNames.length;
  }, [selectedSirets]);

  const getFacilityError = useMemo(() => {
    return facility => {
      if (
        selectedSirets.filter(f => f.usualName === facility.usualName).length >
        1
      ) {
        return "Ce nom est utilisé plusieurs fois";
      }
      return null;
    };
  }, [selectedSirets]);

  const allFacilitiesAlreadyRegistered = useMemo(
    () =>
      facilities.length > 0 &&
      facilities.filter(f => !f.registered).length === 0,
    [facilities]
  );

  return (
    <Step
      reset={() => {
        setFacilities(fs => fs.map(f => ({ ...f, selected: false })));
        setHasValidatedChoice(false);
      }}
      complete={hasValidatedChoice && areFacilitiesCorrectlySet}
      {...props}
    >
      {allFacilitiesAlreadyRegistered && <AlreadyRegisteredSirets />}
      <Grid container key={2} spacing={3} wrap="wrap">
        {facilities.map((facility, index) => (
          <Grid item key={facility.siret} xs={12}>
            <Stack direction="column" alignItems="flex-start" spacing={0}>
              <Button
                onClick={() => {
                  setHasValidatedChoice(false);
                  const newFacilities = [...facilities];
                  newFacilities.splice(index, 1, {
                    ...facility,
                    selected: !facility.selected
                  });
                  setFacilities(newFacilities);
                }}
                disabled={facility.registered}
                fullWidth
                sx={{ padding: 0 }}
              >
                <FacilityInfo
                  facility={facility}
                  selected={facility.selected}
                  alreadyRegistered={facility.registered}
                />
              </Button>
              {facility.selected && (
                <Stack
                  direction="column"
                  spacing={1}
                  textAlign="left"
                  sx={{ marginTop: 1 }}
                >
                  <TextInput
                    required
                    label="Nom usuel"
                    value={facility.usualName}
                    onChange={e => {
                      setHasValidatedChoice(false);
                      updateFacility(facility, "usualName", e.target.value);
                    }}
                    {...(getFacilityError(facility)
                      ? {
                          messageType: "error",
                          message: getFacilityError(facility)
                        }
                      : {})}
                  />
                  <PhoneNumber
                    currentPhoneNumber={facility.phone_number}
                    setCurrentPhoneNumber={newPhoneNumber => {
                      setHasValidatedChoice(false);
                      updateFacility(facility, "phoneNumber", newPhoneNumber);
                    }}
                    label="Numéro de téléphone de l'entreprise"
                    accessibilityHelpText={`${facility.address}, ${facility.postal_code}`}
                  />
                  <BusinessType
                    onChangeBusinessType={newBusinessType => {
                      setHasValidatedChoice(false);
                      updateFacility(facility, "businessType", newBusinessType);
                    }}
                    required
                    displayInfo
                    forceColumn
                  />
                </Stack>
              )}
            </Stack>
          </Grid>
        ))}
      </Grid>
      {!hasValidatedChoice && (
        <Button
          aria-label="Continuer"
          className={classes.verticalFormButton}
          variant="contained"
          color="primary"
          disabled={!areFacilitiesCorrectlySet}
          onClick={() => setHasValidatedChoice(true)}
        >
          Continuer
        </Button>
      )}
    </Step>
  );
}
