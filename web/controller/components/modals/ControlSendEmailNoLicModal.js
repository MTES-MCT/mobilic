import React from "react";
import Modal from "../../../common/Modal";
import { Typography, Box } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { EmailField } from "../../../common/EmailField";
import { Notice } from "@codegouvfr/react-dsfr/Notice";

export default function ControlSendEmailNoLicModal({
  open,
  handleClose,
  handleSend,
  isLoading,
  sentToDriver = false,
  sentToAdmin = false
}) {
  const [driverEmailAddress, setDriverEmailAddress] = React.useState("");
  const [driverEmailError, setDriverEmailError] = React.useState("");
  const [companyEmailAddress, setCompanyEmailAddress] = React.useState("");
  const [companyEmailError, setCompanyEmailError] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setDriverEmailAddress("");
      setDriverEmailError("");
      setCompanyEmailAddress("");
      setCompanyEmailError("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!driverEmailAddress.trim() && !companyEmailAddress.trim()) {
      const message = "Veuillez renseigner au moins une adresse email.";
      setDriverEmailError(message);
      setCompanyEmailError(message);
      return;
    }
    let success = true;
    if (driverEmailAddress.trim()) {
      success = (await handleSend(driverEmailAddress.trim(), false)) && success;
    }
    if (companyEmailAddress.trim()) {
      success = (await handleSend(companyEmailAddress.trim(), true)) && success;
    }
    if (success) {
      handleClose();
    }
  };

  const handleCancel = () => {
    setDriverEmailAddress("");
    handleClose();
  };

  return (
    <Modal
      open={open}
      handleClose={handleCancel}
      title="Envoi du bulletin de contrôle par email"
      size="sm"
      content={
        <Box>
          <Typography gutterBottom sx={{ mb: 1 }}>
            {sentToDriver && sentToAdmin
              ? "Le bulletin a déjà été transmis au conducteur et à l'entreprise responsable. Vous pouvez le renvoyer si nécessaire."
              : sentToDriver
              ? "Le bulletin a déjà été transmis au conducteur. Vous pouvez l'envoyer à l'entreprise responsable."
              : sentToAdmin
              ? "Le bulletin a déjà été transmis à l'entreprise responsable. Vous pouvez l'envoyer au conducteur."
              : "Le bulletin sera transmis au conducteur. Vous pouvez également l'envoyer à l'entreprise responsable."}
          </Typography>

          {
            (!sentToDriver && !sentToAdmin) && (
              <Notice
                title="Une fois envoyé, le bulletin ne pourra plus être modifié."
                severity="warning"
                iconDisplayed
                style={{ marginBottom: "2rem" }}
              />
            )
          }

          <EmailField
            value={driverEmailAddress}
            setValue={setDriverEmailAddress}
            validate
            error={driverEmailError}
            setError={setDriverEmailError}
            label="Adresse email du conducteur"
          />
          <EmailField
            value={companyEmailAddress}
            setValue={setCompanyEmailAddress}
            validate
            error={companyEmailError}
            setError={setCompanyEmailError}
            label="Adresse email de l'entreprise"
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
            disabled={isLoading}
          >
            {isLoading ? "Envoi..." : "Envoyer le bulletin"}
          </Button>
        </>
      }
    />
  );
}
