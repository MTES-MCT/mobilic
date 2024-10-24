import { Button } from "@codegouvfr/react-dsfr/Button";
import { useApi } from "common/utils/api";
import { RESET_PASSWORD_CONNECTED_MUTATION } from "common/utils/apiQueries";
import { clearUpdateTimeCookie, snooze } from "common/utils/updatePassword";
import React, { useState } from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { LoadingButton } from "common/components/LoadingButton";
import { getPasswordErrors } from "common/utils/passwords";
import { NewPasswordBlock } from "../../common/NewPasswordBlock";
import { currentUserId } from "common/utils/cookie";
import Modal from "../../common/Modal";

export default function UpdatePasswordModal() {
  const api = useApi();
  const alerts = useSnackbarAlerts();
  const [isOpen, setIsOpen] = useState(true);

  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordCopy, setPasswordCopy] = React.useState("");

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
    <Modal
      open={isOpen}
      handleClose={handleClose}
      title="Modifier votre mot de passe"
      size="sm"
      content={
        <>
          <p>
            Suite à une mise à jour de notre politique de sécurité, veuillez
            réinitialiser votre mot de passe pour continuer à utiliser Mobilic.
          </p>
          <form
            className="vertical-form centered"
            autoComplete="off"
            onSubmit={handleSubmit}
            id="new-password-form"
          >
            <NewPasswordBlock
              label="Veuillez choisir un nouveau mot de passe."
              password={password}
              setPassword={setPassword}
              passwordError={passwordError}
              passwordCopy={passwordCopy}
              setPasswordCopy={setPasswordCopy}
              passwordCopyError={passwordCopyError}
            />
          </form>
        </>
      }
      actions={
        <>
          <Button
            priority="secondary"
            title="Me le rappeler plus tard"
            onClick={() => {
              snooze();
              setIsOpen(false);
            }}
            nativeButtonProps={{
              form: "new-password-form"
            }}
          >
            Plus tard
          </Button>
          <LoadingButton
            title="Réinitialiser mon mot de passe"
            type="submit"
            disabled={
              !password ||
              !passwordCopy ||
              !!passwordError ||
              !!passwordCopyError
            }
            loading={loading}
            form="new-password-form"
          >
            Valider
          </LoadingButton>
        </>
      }
    />
  );
}
