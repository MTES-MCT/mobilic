import React from "react";
import { Step } from "./Step";
import { makeStyles } from "@mui/styles";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { Button } from "@codegouvfr/react-dsfr/Button";

const useStyles = makeStyles(theme => ({
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
          control={<Radio />}
          label="Non, je souhaite inscrire une seule unité légale."
        />
        <FormControlLabel
          className={classes.radioButton}
          value={"yes"}
          control={<Radio />}
          label="Oui, je souhaite inscrire plusieurs établissements pour les gérer de manière distincte."
        />
      </RadioGroup>
      {!hasValidatedChoice && !shouldSelectSirets && (
        <Button
          className={classes.verticalFormButton}
          onClick={() => setHasValidatedChoice(true)}
        >
          Continuer
        </Button>
      )}
    </Step>
  );
}
