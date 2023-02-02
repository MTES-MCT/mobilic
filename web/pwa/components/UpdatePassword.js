import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { REQUEST_RESET_PASSWORD_MUTATION } from "common/utils/apiQueries";
import { snooze } from "common/utils/updatePassword";
import React, { useState } from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { LoadingButton } from "common/components/LoadingButton";
import { PasswordField } from "common/components/PasswordField";
import { getPasswordErrors } from "common/utils/passwords";
import { PasswordHelper } from "../../common/PasswordHelper";

const useStyles = makeStyles(theme => ({
  modalFooter: {
    display: "flex",
    flexDirection: "row-reverse"
  },
  modalButton: {
    marginLeft: theme.spacing(2)
  }
}));

export default function UpdatePasswordModal() {
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [isOpen, setIsOpen] = useState(true);
  const store = useStoreSyncedWithLocalStorage();

  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState(null);
  const [passwordCopy, setPasswordCopy] = React.useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        REQUEST_RESET_PASSWORD_MUTATION,
        { mail: store.state.userInfo.email },
        {
          context: { nonPublicApi: true }
        },
        true
      );

      setLoading(false);
      if (!apiResponse.data.account.requestResetPassword.success) {
        throw Error;
      }
      setIsOpen(false);
      snooze();
      alerts.success(
        "Votre demande de réinitialisation de mot de passe a été enregistrée. Vous allez recevoir un email d'instructions.",
        "",
        6000
      );
    }, "request-reset-password");
  };

  const handleClose = () => setIsOpen(false);

  return (
    <Dialog maxWidth="sm" onClose={handleClose} open={isOpen} fullWidth>
      <form
        className="vertical-form centered"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <CustomDialogTitle
          handleClose={handleClose}
          title="Modifier votre mot de passe"
        />
        <DialogContent>
          <p>
            Suite à une mise à jour de notre politique de sécurité, veuillez
            réinitialiser votre mot de passe pour continuer à utiliser Mobilic.
          </p>
          <Typography className={classes.introText}>
            Veuillez choisir un nouveau mot de passe.
          </Typography>
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
            error={password ? getPasswordErrors(password) : null}
          />
          <PasswordHelper password={password} />
          <PasswordField
            required
            fullWidth
            label="Confirmez le mot de passe"
            className="vertical-form-text-input"
            autoComplete="new-password"
            variant="standard"
            error={
              passwordCopy && passwordCopy !== password
                ? "Le mot de passe n'est pas identique"
                : null
            }
            value={passwordCopy}
            onChange={e => {
              setPasswordCopy(e.target.value);
            }}
          />
        </DialogContent>
        <CustomDialogActions>
          <Button
            className={classes.modalButton}
            title="remind-later"
            secondary
            onClick={() => {
              snooze();
              setIsOpen(false);
            }}
          >
            Plus tard
          </Button>
          <LoadingButton
            className={classes.modalButton}
            title="reset-password"
            color="primary"
            variant="contained"
            type="submit"
            disabled={
              !password ||
              !passwordCopy ||
              getPasswordErrors(password) ||
              password !== passwordCopy
            }
            loading={loading}
          >
            Valider
          </LoadingButton>
        </CustomDialogActions>
      </form>
    </Dialog>
  );
}
