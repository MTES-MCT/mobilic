import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles(theme => ({
  button: {
    boxShadow: `inset 0 -1px 0 ${fr.colors.decisions.border.actionHigh.blueFrance.default}`,
    paddingLeft: 0,
    paddingRight: 0,
    paddingBottom: 1
  }
}));

export const ControllerControlBackButton = ({ onClick, children }) => {
  const classes = useStyles();

  return (
    <Button
      onClick={onClick}
      priority="secondary"
      iconId="fr-icon-arrow-left-s-line"
      iconPosition="left"
      className={classes.button}
    >
      {children}
    </Button>
  );
};
