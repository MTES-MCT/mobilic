import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import React from "react";
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
    minWidth: 200,
    maxWidth: 450,
    marginBottom: theme.spacing(2)
  }
}));

export function SelectSiretsStep({ facilities, setFacilities, ...props }) {
  const [hasValidatedChoice, setHasValidatedChoice] = React.useState(false);
  const classes = useStyles();

  return (
    <Step
      reset={() => {
        setFacilities(fs =>
          fs.map(f => ({ ...f, selected: false, usualName: f.name }))
        );
        setHasValidatedChoice(false);
      }}
      complete={hasValidatedChoice && facilities.some(f => f.selected)}
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
          disabled={!facilities.some(f => f.selected)}
          onClick={() => setHasValidatedChoice(true)}
        >
          Continuer
        </Button>
      )}
    </Step>
  );
}
