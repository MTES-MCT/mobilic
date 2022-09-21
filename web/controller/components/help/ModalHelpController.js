import React from "react";
import { ControllerHelpCard } from "../home/ControllerHelpCard";
import Stack from "@mui/material/Stack";

export function HelpController() {
  return (
    <Stack spacing={2}>
      <ControllerHelpCard
        icon="fr-icon-lightbulb-fill fr-icon--lg"
        title="NATINF expliqués"
        description="Comprendre les codes associés aux seuils réglementaires"
        linkTo="https://app.gitbook.com/invite/-MMKfijmgB1Sviz-n2vh/DgrUI15YCohwADMt91bF"
      />
      <ControllerHelpCard
        icon="fr-icon-question-fill fr-icon--lg"
        title="FAQ"
        description="Trouvez les réponses à vos questions"
        linkTo="https://app.gitbook.com/o/-MMKfijmgB1Sviz-n2vh/s/5P00lZMB3lX6eHmhKqiJ/"
      />
      <ControllerHelpCard
        icon="fr-icon-git-repository-fill"
        title="Documentation"
        description="Comment utiliser Mobilic ?"
      />
      <ControllerHelpCard
        icon="fr-icon-question-answer-fill fr-icon--lg"
        title="Messagerie instantanée"
        description="Échangez avec l’équipe Mobilic et d’autres CTT sur notre forum Tchap !"
      />
    </Stack>
  );
}
