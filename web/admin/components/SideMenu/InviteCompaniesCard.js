import React from "react";

import EmailSvg from "common/assets/images/email.svg";
import { useModals } from "common/utils/modals";
import { useInviteCompanies } from "../../../common/hooks/useInviteCompanies";
import { Card } from "./Cards";

export function InviteCompaniesCard() {
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
    <Card
      onClick={() =>
        modals.open("batchInvite", {
          handleSubmit: inviteCompanies,
          title: "Faire connaître Mobilic",
          description: (
            <p>
              Renseignez l’adresse e-mail des personnes à qui vous souhaitez
              faire découvrir Mobilic. Nous leur enverrons alors un message en
              stipulant que nous venons de votre part.
            </p>
          ),
          acceptButtonTitle: "Envoyer les invitations"
        })
      }
      svg={EmailSvg}
      buttonTitle="Faire connaître Mobilic"
    />
  );
}
