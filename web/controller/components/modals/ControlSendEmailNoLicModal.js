import React from "react";
import Modal from "../../../common/Modal";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
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
  sentToAdmin = false,
  handDelivered = false,
  handleHandDeliveredChange
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
      const message = "Veuillez renseigner ce champ.";
      if (!handDelivered) {
        setDriverEmailError(message);
      }
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

  const getSentStatusMessage = () => {
    if (sentToDriver && sentToAdmin) {
      return "Le bulletin a déjà été transmis au conducteur et à l'entreprise responsable. Vous pouvez le renvoyer si nécessaire.";
    }
    if (sentToDriver) {
      return "Le bulletin a déjà été transmis au conducteur. Vous pouvez l'envoyer à l'entreprise responsable.";
    }
    if (sentToAdmin) {
      return "Le bulletin a déjà été transmis à l'entreprise responsable. Vous pouvez l'envoyer au conducteur.";
    }
    return null;
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
            {getSentStatusMessage()}
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

          <Box mb="1.5rem">
            <Checkbox
              size="small"
              options={[
                {
                  label: "Le bulletin a été remis au conducteur au format papier",
                  nativeInputProps: {
                    checked: handDelivered,
                    onChange: e => {
                      handleHandDeliveredChange(e);
                    },
                    disabled: sentToDriver
                  },
                }
              ]}
            />
          </Box>
          <EmailField
            value={driverEmailAddress}
            setValue={setDriverEmailAddress}
            validate
            error={driverEmailError}
            setError={setDriverEmailError}
            label="Adresse email du conducteur"
            disabled={handDelivered}
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
