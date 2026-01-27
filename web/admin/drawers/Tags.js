import React from "react";
import { fr } from "@codegouvfr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { Tag } from "@codegouvfr/react-dsfr/Tag";

const tagsStyles = makeStyles((theme) => ({
  running: {
    color: fr.colors.decisions.background.flat.warning.default,
    backgroundColor: fr.colors.decisions.background.contrast.warning.default
  },
  waiting: {
    color: fr.colors.decisions.background.flat.blueFrance.default,
    backgroundColor: fr.colors.decisions.background.contrast.blueFrance.default
  },
  toValidate: {
    color: fr.colors.decisions.background.flat.yellowTournesol.default,
    backgroundColor:
      fr.colors.decisions.background.contrast.yellowTournesol.default
  }
}));

export const RunningTag = () => {
  const classes = tagsStyles();
  return <Tag className={classes.running}>Mission en cours</Tag>;
};

export const ToValidateTag = () => {
  const classes = tagsStyles();
  return (
    <Tag iconId="fr-icon-warning-line" className={classes.toValidate}>
      Saisies à valider
    </Tag>
  );
};

export const WaitingTag = () => {
  const classes = tagsStyles();
  return (
    <Tag className={classes.waiting}>
      En attente de validation par le salarié
    </Tag>
  );
};
