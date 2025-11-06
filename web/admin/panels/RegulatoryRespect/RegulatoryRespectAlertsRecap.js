import React from "react";
import { AccordionDetails, Stack, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { fr } from "@codegouvfr/react-dsfr";

const useStyles = makeStyles((theme) => ({
  title: {
    color: fr.colors.decisions.text.actionHigh.grey.default,
    fontSize: "1.25rem",
    fontWeight: 700,
  },
  description: {
    fontSize: "0.875rem",
    color: fr.colors.decisions.text.mention.grey.default,
  },
}));

export const AlertsRecap = ({ ...otherProps }) => {
  const classes = useStyles();
  return (
    <Stack {...otherProps} rowGap={4}>
      <Stack rowGap={1}>
        <Typography className={classes.title}>
          Respects des seuils journaliers
        </Typography>
        <Typography className={classes.description}>
          Dépliez les seuils pour afficher les missions concernées par les
          dépassements.
        </Typography>
        <Stack mt={2}>
          <Accordion label="Repos journalier">
            <AccordionDetails>salut</AccordionDetails>
          </Accordion>
        </Stack>
      </Stack>
      <Typography className={classes.title}>
        Respect des seuils hebdomadaires
      </Typography>
    </Stack>
  );
};
