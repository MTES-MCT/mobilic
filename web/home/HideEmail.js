import React from "react";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { Checkbox } from "@dataesr/react-dsfr";
import Stack from "@mui/material/Stack";
import { useUpdateHideEmail } from "./useUpdateHideEmail";

const useStyles = makeStyles(theme => ({
  fieldName: {
    color: theme.palette.grey[600]
  }
}));

export function HideEmail({ employment }) {
  const updateHideEmail = useUpdateHideEmail(employment);
  const { hideEmail } = employment;
  const classes = useStyles();

  return (
    <Stack mb={2}>
      <Typography align="left" className={classes.fieldName} variant="overline">
        Autorisation d'accès à mon email personnel
      </Typography>
      <Checkbox
        checked={hideEmail}
        onChange={e => updateHideEmail(e.target.checked)}
        label="J'utilise mon mail personnel et je n'autorise pas le(s) gestionnaire(s) de cette entreprise à y avoir accès"
      />
    </Stack>
  );
}
