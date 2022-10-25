import React from "react";
import { ControllerHelpCard } from "../home/ControllerHelpCard";
import Stack from "@mui/material/Stack";

export function HelpController() {
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
      <ControllerHelpCard
        iconName={"fr-icon-question-answer-line"}
        title="Messagerie instantanée"
        description="Échangez avec l’équipe Mobilic et d’autres CTT sur notre forum Tchap !"
        linkTo="https://www.tchap.gouv.fr/#/room/%23SupportMobilicYNhe5wcTWWb:agent.dinum.tchap.gouv.fr"
      />
    </Stack>
  );
}
