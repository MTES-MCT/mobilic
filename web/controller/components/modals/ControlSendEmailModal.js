import React from "react";
import Modal from "../../../common/Modal";
import { Box } from "@mui/material";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(() => ({
  badge: {
    fontSize: "0.60rem"
  }
}));

export default function ControlSendEmailModal({
  open,
  handleClose,
  sendToDriver,
  setSendToDriver,
  sendToAdmin,
  setSendToAdmin,
  displayCompanyName,
  handleSend,
  isLoading,
  adminEmails
}) {
  const classes = useStyles();

  return (
    <Modal
      open={open}
      handleClose={handleClose}
      title="A qui souhaitez-vous envoyer le bulletin de contrôle ?"
      size="sm"
      content={
        <>
          <Checkbox
            legend="Destinataires"
            options={[
              {
                label: (
                  <Box display="flex" alignItems="center" gap={1}>
                    <span>Au conducteur</span>
                    <Badge
                      severity="success"
                      small
                      noIcon
                      className={classes.badge}
                    >
                      envoyé
                    </Badge>
                  </Box>
                ),
                nativeInputProps: {
                  checked: sendToDriver,
                  onChange: e => setSendToDriver(e.target.checked),
                  disabled: true
                },
                hintText:
                  'Le conducteur retrouvera le bulletin de contrôle dans sa page "Mes informations".'
              },
              {
                label: (
                  <span>
                    A l'entreprise responsable{" "}
                    {displayCompanyName && (
                      <>
                        <strong>{displayCompanyName}</strong>
                      </>
                    )}
                  </span>
                ),
                nativeInputProps: {
                  checked: sendToAdmin,
                  onChange: e => setSendToAdmin(e.target.checked)
                },
                hintText:
                  "Ce bulletin sera envoyé par email au(x) gestionnaire(s) concerné(s)."
              }
            ]}
          />
        </>
      }
      actions={
        <>
          <Button
            priority="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            priority="primary"
            onClick={handleSend}
            disabled={isLoading || adminEmails.length === 0}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer"}
          </Button>
        </>
      }
    />
  );
}
