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
  isLoading
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

  const handleSubmit = () => {
    if (driverEmailAddress.trim()) {
      handleSend(driverEmailAddress.trim());
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
            Le bulletin sera transmis au conducteur.<br/>Vous pouvez également l'envoyer à l'entreprise responsable.
          </Typography>
          <Typography gutterBottom sx={{ mb: 3 }} style={{color: "gray", fontSize: "0.8rem"}}>
            * Informations obligatoires
          </Typography>

          <Notice
            title="Une fois envoyé, le bulletin ne pourra plus être modifié."
            severity="warning"
            iconDisplayed
            style={{ marginBottom: "2rem" }}
          />

          <EmailField
            required
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
            disabled={isLoading || (!driverEmailAddress.trim() || !!driverEmailError)}
          >
            {isLoading ? "Envoi..." : "Envoyer le bulletin"}
          </Button>
        </>
      }
    />
  );
}
