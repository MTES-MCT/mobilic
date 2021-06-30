import React, { useEffect } from "react";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import { LoadingButton } from "common/components/LoadingButton";

export function ErrorFallback({ error }) {
  useEffect(() => {
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
  }, [error]);

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
      <LoadingButton
        color="primary"
        variant="contained"
        onClick={() => window.location.reload()}
      >
        Recharger la page
      </LoadingButton>
    </Container>
  );
}
