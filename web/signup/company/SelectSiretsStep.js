import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React, { useMemo } from "react";
import { Step } from "./Step";
import { makeStyles } from "@mui/styles";
import Grid from "@mui/material/Grid";
import { FacilityInfo } from "./FacilityInfo";

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
    // values should be unique
    return [...new Set(selectedNames)].length === selectedNames.length;
  }, [selectedSirets]);

  const getFacilityError = useMemo(() => {
    return facility => {
      if (!facility.usualName) {
        return "Veuillez entrer un nom pour cette entreprise";
      }

      if (
        selectedSirets.filter(f => f.usualName === facility.usualName).length >
        1
      ) {
        return "Ce nom est utilisé plusieurs fois";
      }
      return null;
    };
  }, [selectedSirets]);

  return (
    <Step
      reset={() => {
        setFacilities(fs => fs.map(f => ({ ...f, selected: false })));
        setHasValidatedChoice(false);
      }}
      complete={hasValidatedChoice && areFacilitiesCorrectlySet}
      {...props}
    >
      <Grid container key={2} spacing={3} wrap="wrap">
        {facilities.map((facility, index) => (
          <Grid item key={facility.siret}>
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
            >
              <FacilityInfo
                facility={facility}
                selected={facility.selected}
                alreadyRegistered={facility.registered}
              />
            </Button>
            {facility.selected && (
              <TextField
                variant="standard"
                className={classes.siretName}
                required
                label="Nom usuel"
                value={facility.usualName}
                onChange={e => {
                  setHasValidatedChoice(false);
                  setFacilities(
                    facilities.map(f =>
                      f.siret === facility.siret
                        ? { ...f, usualName: e.target.value }
                        : f
                    )
                  );
                }}
                error={!!getFacilityError(facility)}
                helperText={getFacilityError(facility)}
              />
            )}
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
