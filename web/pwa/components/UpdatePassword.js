import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalTitle
} from "@dataesr/react-dsfr";
import { makeStyles } from "@mui/styles";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { REQUEST_RESET_PASSWORD_MUTATION } from "common/utils/apiQueries";
import { snooze } from "common/utils/updatePassword";
import React, { useState } from "react";
import { useSnackbarAlerts } from "../../common/Snackbar";

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

  const handleSubmit = async e => {
    e.preventDefault();
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        REQUEST_RESET_PASSWORD_MUTATION,
        { mail: store.state.userInfo.email },
        {
          context: { nonPublicApi: true }
        },
        true
      );
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

  return (
    <Modal isOpen={isOpen} size="lg">
      <ModalTitle>Modifier votre mot de passe</ModalTitle>
      <ModalContent>
        <p>
          Suite à une mise à jour de notre politique de sécurité, veuillez
          réinitialiser votre mot de passe pour continuer à utiliser Mobilic.
        </p>
      </ModalContent>
      <ModalFooter className={classes.modalFooter}>
        <Button
          className={classes.modalButton}
          title="reset-password"
          onClick={e => {
            handleSubmit(e);
          }}
        >
          Je réinitialise mon mot de passe
        </Button>
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
      </ModalFooter>
    </Modal>
  );
}
