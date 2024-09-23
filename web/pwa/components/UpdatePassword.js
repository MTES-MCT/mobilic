import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { RESET_PASSWORD_CONNECTED_MUTATION } from "common/utils/apiQueries";
import { clearUpdateTimeCookie, snooze } from "common/utils/updatePassword";
import React, { useState } from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import {
  CustomDialogActions,
  CustomDialogTitle
} from "../../common/CustomDialogTitle";
import { LoadingButton } from "common/components/LoadingButton";
import { getPasswordErrors } from "common/utils/passwords";
import { NewPasswordBlock } from "../../common/NewPasswordBlock";
import { currentUserId } from "common/utils/cookie";

const useStyles = makeStyles(theme => ({
  modalFooter: {
    display: "flex",
    flexDirection: "row-reverse"
  },
  modalButton: {
    marginLeft: theme.spacing(2)
  },
  prioritaryModal: {
    zIndex: 2500
  }
}));

export default function UpdatePasswordModal() {
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [isOpen, setIsOpen] = useState(true);

  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState(null);
  const [passwordCopy, setPasswordCopy] = React.useState(null);

  const passwordError = password ? getPasswordErrors(password) : null;
  const passwordCopyError =
    passwordCopy && passwordCopy !== password
      ? "Le mot de passe n'est pas identique"
      : null;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        RESET_PASSWORD_CONNECTED_MUTATION,
        { password, userId: currentUserId() },
        { context: { nonPublicApi: true } },
        true
      );

      if (!apiResponse.data.account.resetPasswordConnected.success) {
        throw Error;
      }
      setIsOpen(false);
      clearUpdateTimeCookie();
      alerts.success("Votre mot de passe a bien été modifié.", "", 6000);
    }, "reset-password");
    setLoading(false);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <Dialog
      className={classes.prioritaryModal}
      maxWidth="sm"
      onClose={handleClose}
      open={isOpen}
      fullWidth
    >
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
          <NewPasswordBlock
            label="Veuillez choisir un nouveau mot de passe."
            password={password}
            setPassword={setPassword}
            passwordError={passwordError}
            passwordCopy={passwordCopy}
            setPasswordCopy={setPasswordCopy}
            passwordCopyError={passwordCopyError}
          />
        </DialogContent>
        <CustomDialogActions>
          <Button
            className={classes.modalButton}
            title="Me le rappeler plus tard"
            color="primary"
            variant="outlined"
            onClick={() => {
              snooze();
              setIsOpen(false);
            }}
          >
            Plus tard
          </Button>
          <LoadingButton
            className={classes.modalButton}
            title="Réinitialiser mon mot de passe"
            color="primary"
            variant="contained"
            type="submit"
            disabled={
              !password ||
              !passwordCopy ||
              !!passwordError ||
              !!passwordCopyError
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
