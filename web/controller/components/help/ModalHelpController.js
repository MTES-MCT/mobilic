import React, { useState } from "react";
import Stack from "@mui/material/Stack";
import {
  useStoreSyncedWithLocalStorage
} from "../../../../common/store/store";
import { LiveChat } from "../../../common/LiveChat";
import { ControllerHelpCard } from "../home/ControllerHelpCard";

export function HelpController() {
  const [openChat, setOpenChat] = useState(false);
  const store = useStoreSyncedWithLocalStorage();
  const userId = store.userId();
  const userInfo = store.userInfo();

  const handleChatClick = () => {
    setOpenChat(true);
  }

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
      {process.env.REACT_APP_BREVO_CONV_ID && (
        <ControllerHelpCard
          iconName={"fr-icon-questionnaire-fill"}
          title="Service Support"
          description="Un problème technique ou une question règlementaire ? Contactez l'équipe Mobilic"
          clickAction={handleChatClick}
        />
      )}
      {
        openChat && 
        <LiveChat userId={userId} userInfo={userInfo} position="bl" open={true}/>
      }
    </Stack>
  );
}
