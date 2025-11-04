import React from "react";
import Modal from "../../../common/Modal";
import { Typography, Box } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { EmailField } from "../../../common/EmailField";

export default function ControlSendEmailNoLicModal({
  open,
  handleClose,
  handleSend,
  isLoading
}) {
  const [emailAddress, setEmailAddress] = React.useState("");
  const [emailError, setEmailError] = React.useState("");

  const handleSubmit = () => {
    if (emailAddress.trim()) {
      handleSend(emailAddress.trim());
    }
  };

  const handleCancel = () => {
    setEmailAddress("");
    handleClose();
  };

  return (
    <Modal
      open={open}
      handleClose={handleCancel}
      title="Destinataire du bulletin de contrôle"
      size="sm"
      content={
        <Box>
          <Typography gutterBottom sx={{ mb: 3 }}>
            Ce bulletin sera envoyé par email à l'adresse d'entreprise
            renseignée dans le champ ci-dessous.
          </Typography>

          <EmailField
            required
            value={emailAddress}
            setValue={setEmailAddress}
            validate
            error={emailError}
            setError={setEmailError}
          />
        </Box>
      }
      actions={
        <>
          <Button
            priority="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !emailAddress.trim() || !!emailError}
          >
            {isLoading ? "Envoi..." : "Envoyer"}
          </Button>
        </>
      }
    />
  );
}
