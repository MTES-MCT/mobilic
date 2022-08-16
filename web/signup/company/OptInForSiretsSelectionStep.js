import Button from "@mui/material/Button";
import React from "react";
import { Step } from "./Step";
import { makeStyles } from "@mui/styles";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";

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
  }
}));

export function OptInForSiretsSelectionStep({
  shouldSelectSirets,
  setShouldSelectSirets,
  ...props
}) {
  const [hasValidatedChoice, setHasValidatedChoice] = React.useState(false);
  const classes = useStyles();

  return (
    <Step
      reset={() => {
        setHasValidatedChoice(false);
        setShouldSelectSirets(false);
      }}
      complete={shouldSelectSirets || hasValidatedChoice}
      {...props}
    >
      <RadioGroup
        aria-label="gender"
        name="controlled-radio-buttons-group"
        value={shouldSelectSirets ? "yes" : "no"}
        onChange={e => {
          setHasValidatedChoice(false);
          setShouldSelectSirets(e.target.value === "yes");
        }}
      >
        <FormControlLabel
          className={classes.radioButton}
          value={"no"}
          control={<Radio color="secondary" />}
          label="Non, je souhaite inscrire une seule unité légale."
        />
        <FormControlLabel
          className={classes.radioButton}
          value={"yes"}
          control={<Radio color="secondary" />}
          label="Oui, je souhaite inscrire plusieurs établissements pour les gérer de manière distincte."
        />
      </RadioGroup>
      {!hasValidatedChoice && !shouldSelectSirets && (
        <Button
          aria-label="Continuer"
          className={classes.verticalFormButton}
          variant="contained"
          color="primary"
          onClick={() => setHasValidatedChoice(true)}
        >
          Continuer
        </Button>
      )}
    </Step>
  );
}
