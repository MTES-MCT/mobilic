import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import * as Sentry from "@sentry/react";
import { formatPersonName } from "common/utils/coworkers";
import { useStoreSyncedWithLocalStorage } from "common/store/store";

export function ErrorFallback() {
  return (
    <Container
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        flexGrow: 1,
        alignItems: "center"
      }}
    >
      <Typography>Oups..une erreur est survenue</Typography>
      <LoadingButton onClick={() => window.location.reload()}>
        Recharger la page
      </LoadingButton>
    </Container>
  );
}

export function ErrorBoundary({ children }) {
  const store = useStoreSyncedWithLocalStorage();
  const userInfo = store.userInfo();

  return (
    <Sentry.ErrorBoundary
      onError={error => {
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;
        if (error?.message && chunkFailedMessage.test(error.message)) {
          const latestChunkFailedError = localStorage
            ? parseInt(localStorage.getItem("chunkFailed"))
            : null;
          const now = Date.now();
          if (localStorage) localStorage.setItem("chunkFailed", now.toString());
          if (!latestChunkFailedError || latestChunkFailedError + 10000 < now) {
            window.location.reload();
          }
        }
      }}
      fallback={ErrorFallback}
      showDialog
      dialogOptions={{
        user: { email: userInfo.email, name: formatPersonName(userInfo) },
        title: "Oups... une erreur est survenue",
        subtitle: "Nous avons été alertés de cette erreur",
        subtitle2: "Pour nous aider, dites-nous précisément ce qui s'est passé",
        labelName: "Nom",
        labelEmail: "Email",
        labelComments: "Que s'est-il passé ?",
        labelClose: "Fermer",
        labelSubmit: "Envoyer le rapport",
        errorGeneric:
          "Une erreur est survenue lors de l'envoi du rapport. Veuillez réessayer",
        errorFormEntry:
          "Certains champs ne sont pas valides. Veuillez les corriger avant un nouvel envoi",
        successMessage: "Nous avons bien reçu votre message, merci !"
      }}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
