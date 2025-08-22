import React from "react";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { arrowButtonStyles } from "./ArrowButton";

export const ControllerControlBackButton = ({ onClick, children }) => {
  const classes = arrowButtonStyles();

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
