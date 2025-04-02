import React from "react";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import { Button } from "@codegouvfr/react-dsfr/Button";
import EmailSvg from "common/assets/images/email.svg";
import { useModals } from "common/utils/modals";
import { useInviteCompanies } from "../../../common/hooks/useInviteCompanies";

export function Cards() {
  const modals = useModals();

  const onSucess = () => {
    modals.open("successMessage", {
      title: (
        <>
          <span
            className={`fr-icon-send-plane-fill`}
            style={{ marginRight: "8px" }}
            aria-hidden="true"
          ></span>
          C’est parti !
        </>
      ),
      description:
        "L’e-mail de présentation de Mobilic a bien été envoyé à vos contacts. Nous vous remercions d'être ambassadeur de Mobilic !"
    });
  };
  const { inviteCompanies } = useInviteCompanies(onSucess);

  return (
    <Box ml={2}>
      <Paper variant="outlined">
        <Button
          onClick={() =>
            modals.open("batchInvite", {
              handleSubmit: inviteCompanies,
              title: "Faire connaître Mobilic",
              description: (
                <p>
                  Renseignez l’adresse e-mail des personnes à qui vous souhaitez
                  faire découvrir Mobilic. Nous leur enverrons alors un message
                  en stipulant que nous venons de votre part.
                </p>
              ),
              acceptButtonTitle: "Envoyer les invitations"
            })
          }
          priority="secondary"
          style={{ boxShadow: "none" }}
        >
          <Stack direction="column" gap={2}>
            <img alt="" src={EmailSvg} style={{ flexShrink: 1 }} width={244} />
            <Typography
              variant="body1"
              className="fr-icon-arrow-right-line fr-btn--icon-right"
            >
              Faire connaître Mobilic
            </Typography>
          </Stack>
        </Button>
      </Paper>
    </Box>
  );
}
