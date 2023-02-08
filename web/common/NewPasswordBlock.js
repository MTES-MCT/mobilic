import React from "react";

import { makeStyles } from "@mui/styles";

import Typography from "@mui/material/Typography";
import { PasswordField } from "common/components/PasswordField";
import { PasswordHelper } from "./PasswordHelper";

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
      <PasswordField
        fullWidth
        className="vertical-form-text-input"
        label="Nouveau mot de passe"
        placeholder="Choisissez un mot de passe"
        autoComplete="new-password"
        variant="standard"
        value={password}
        onChange={e => {
          setPassword(e.target.value);
        }}
        required
        error={passwordError}
      />
      <PasswordHelper password={password} />
      <PasswordField
        required
        fullWidth
        label="Confirmez le mot de passe"
        className="vertical-form-text-input"
        autoComplete="new-password"
        variant="standard"
        error={passwordCopyError}
        value={passwordCopy}
        onChange={e => {
          setPasswordCopy(e.target.value);
        }}
      />
    </>
  );
}
