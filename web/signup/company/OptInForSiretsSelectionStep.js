import Button from "@material-ui/core/Button";
import React from "react";
import { Step } from "./Step";
import makeStyles from "@material-ui/core/styles/makeStyles";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";

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
          control={<Radio />}
          label="Je souhaite gérer dans Mobilic l'unité légale comme un tout. Je n'ai pas besoin de créer plusieurs entreprises Mobilic associées à ce SIREN (recommandé)."
        />
        <FormControlLabel
          className={classes.radioButton}
          value={"yes"}
          control={<Radio />}
          label="J'ai besoin de séparer la gestion de mes établissements. Je crée plusieurs entreprises Mobilic correspondant chacune à un ou plusieurs de mes établissements."
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
