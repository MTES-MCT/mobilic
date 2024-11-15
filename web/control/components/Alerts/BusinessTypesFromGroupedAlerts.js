import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";
import { FieldTitle } from "../../../common/typography/FieldTitle";

const useStyles = makeStyles(theme => ({
  businessTypesContainer: {
    backgroundColor: fr.colors.decisions.background.default.grey.hover
  }
}));

export const DisplayBusinessTypes = ({ businessTypes }) => {
  const classes = useStyles();

  if (!businessTypes || businessTypes.length === 0) {
    return null;
  }

  return (
    <Box p={2} className={classes.businessTypesContainer}>
      <FieldTitle component="h2">Type(s) d'activité</FieldTitle>
      <Typography>{businessTypes.join(", ")}</Typography>
    </Box>
  );
};
