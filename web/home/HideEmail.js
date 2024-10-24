import React from "react";
import { makeStyles } from "@mui/styles";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useUpdateHideEmail } from "./useUpdateHideEmail";

const useStyles = makeStyles(theme => ({
  fieldName: {
    color: theme.palette.grey[700],
    fontSize: "0.875rem"
  }
}));

export function HideEmail({ employment }) {
  const updateHideEmail = useUpdateHideEmail(employment);
  const { hideEmail } = employment;
  const classes = useStyles();

  return (
    <Checkbox
      legend="Autorisation d'accès à mon email personnel"
      options={[
        {
          label:
            "J'utilise mon mail personnel et je n'autorise pas le(s) gestionnaire(s) de cette entreprise à y avoir accès",
          nativeInputProps: {
            checked: hideEmail,
            onChange: e => updateHideEmail(e.target.checked)
          }
        }
      ]}
      classes={{
        legend: classes.fieldName
      }}
    />
  );
}
