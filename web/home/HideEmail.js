import React from "react";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { useUpdateHideEmail } from "./useUpdateHideEmail";
import { useTypographyStyles } from "../common/typography/TypographyStyles";

export function HideEmail({ employment, disabled }) {
  const updateHideEmail = useUpdateHideEmail(employment);
  const { hideEmail } = employment;
  const classes = useTypographyStyles();

  return (
    <Checkbox
      disabled={disabled}
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
