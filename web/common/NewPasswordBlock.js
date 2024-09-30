import React from "react";

import { makeStyles } from "@mui/styles";

import Typography from "@mui/material/Typography";
import { PasswordInput } from "./forms/PasswordInput";
import { MandatoryField } from "./MandatoryField";
import { PASSWORD_POLICY_RULES } from "common/utils/passwords";

const useStyles = makeStyles(theme => ({
  introText: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "justify"
  },
  submitText: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10)
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
  const classes = useStyles(theme => ({
    introText: {
      paddingTop: theme.spacing(4),
      paddingBottom: theme.spacing(4),
      textAlign: "justify"
    }
  }));

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
        messages={PASSWORD_POLICY_RULES.map(rule => {
          return {
            message: rule.message,
            severity: !password
              ? "info"
              : rule.validator(password)
              ? "valid"
              : "error"
          };
        })}
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
