import React from "react";
import Stack from "@mui/material/Stack";
import { Crisp } from "crisp-sdk-web";
import { ControllerHelpCard } from "../home/ControllerHelpCard";

export function HelpController() {
  const openChat = () => {
    Crisp.setPosition("left");
    Crisp.chat.show();
    Crisp.chat.open();
  };

  return (
    <Stack spacing={2}>
      <ControllerHelpCard
        iconName={"fr-icon-scales-3-line"}
        title="NATINF expliqués"
        description="Comprendre les codes associés aux seuils réglementaires"
        linkTo="https://mobilic.gitbook.io/natinf-expliques/"
      />
      <ControllerHelpCard
        iconName={"fr-icon-question-fill"}
        title="FAQ"
        description="Trouvez les réponses à vos questions"
        linkTo="https://mobilic.gitbook.io/mobilic-faq-dediee-aux-corps-de-controle/"
      />
      <ControllerHelpCard
        iconName={"fr-icon-git-repository-fill"}
        title="Documentation"
        description="Comment utiliser Mobilic ?"
        linkTo="https://mobilic.beta.gouv.fr/resources/controller"
      />
      {process.env.REACT_APP_CRISP_WEBSITE_ID && (
        <ControllerHelpCard
          iconName={"fr-icon-questionnaire-fill"}
          title="Service Support"
          description="Un problème technique ou une question règlementaire ? Contactez l'équipe Mobilic"
          clickAction={openChat}
        />
      )}
      <ControllerHelpCard
        iconName={"fr-icon-question-answer-fill"}
        title="Forum Tchap"
        description="Échangez avec d’autres contrôleurs sur notre forum Tchap !"
        linkTo="https://www.tchap.gouv.fr/#/room/%23SupportMobilicYNhe5wcTWWb:agent.dinum.tchap.gouv.fr"
      />
    </Stack>
  );
}
