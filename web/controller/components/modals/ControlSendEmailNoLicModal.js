import React from "react";
import Modal from "../../../common/Modal";
import { Typography, Box } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";

export default function ControlSendEmailNoLicModal({
  open,
  handleClose,
  handleSend,
  isLoading
}) {
  const [emailAddress, setEmailAddress] = React.useState("");

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

          <Input
            label="Adresse email de l'entreprise"
            placeholder="email@mon-entreprise.com"
            nativeInputProps={{
              type: "email",
              value: emailAddress,
              onChange: e => setEmailAddress(e.target.value),
              required: true
            }}
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
            disabled={isLoading || !emailAddress.trim()}
          >
            {isLoading ? "Envoi..." : "Envoyer"}
          </Button>
        </>
      }
    />
  );
}
