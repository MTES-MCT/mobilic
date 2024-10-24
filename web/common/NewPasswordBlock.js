import React from "react";

import { makeStyles } from "@mui/styles";

import Typography from "@mui/material/Typography";
import { PasswordInput } from "./forms/PasswordInput";
import { MandatoryField } from "./MandatoryField";

const useStyles = makeStyles(theme => ({
  introText: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
    textAlign: "justify"
  }
}));

export function NewPasswordBlock({
  label,
  password,
  setPassword,
  passwordError,
  passwordCopy,
  setPasswordCopy,
  passwordCopyError
}) {
  const classes = useStyles();

  return (
    <>
      <Typography className={classes.introText}>{label}</Typography>
      <MandatoryField />
      <PasswordInput
        label="Nouveau mot de passe"
        nativeInputProps={{
          autoComplete: "new-password",
          value: password,
          onChange: e => setPassword(e.target.value)
        }}
        displayMessages
        required
      />
      <PasswordInput
        label="Confirmez le mot de passe"
        nativeInputProps={{
          autoComplete: "new-password",
          value: passwordCopy,
          onChange: e => setPasswordCopy(e.target.value)
        }}
        required
      />
      {!!passwordCopyError && (
        <div className="fr-error-text">{passwordCopyError}</div>
      )}
    </>
  );
}
