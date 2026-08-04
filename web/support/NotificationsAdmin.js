import React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { MobilicHeader } from "../common/Header";
import { Main } from "../common/semantics/Main";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { usePageTitle } from "../common/UsePageTitle";
import { useHistory } from "react-router-dom";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { getFallbackRoute } from "../common/routes";
import { RESET_PUSH_OPT_IN_BANNER_MUTATION } from "common/utils/apiQueries/misc";

export default function NotificationsAdmin() {
  usePageTitle("Support - Notifications - Mobilic");
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const history = useHistory();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const userInfo = store.userInfo();
  const companies = store.companies();

  React.useEffect(() => {
    if (userInfo?.id && (!userInfo?.bizdev || !userInfo?.totpEnabled)) {
      history.replace(
        getFallbackRoute({
          userInfo,
          companies,
          controllerInfo: store.controllerInfo()
        })
      );
    }
  }, [userInfo, companies, history, store]);

  const handleReset = async () => {
    setLoading(true);
    setResult(null);
    try {
      await api.graphQlMutate(
        RESET_PUSH_OPT_IN_BANNER_MUTATION,
        {},
        { context: { nonPublicApi: true } }
      );
      setResult("success");
    } catch {
      setResult("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MobilicHeader />
      <Main>
        <PaperContainer>
          <Container maxWidth="md">
            <PaperContainerTitle variant="h1" sx={{ textAlign: "center" }}>
              Notifications
            </PaperContainerTitle>

            <Box sx={{ padding: 3 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: 2,
                  color:
                    fr.colors.decisions.text.title.grey.default
                }}
              >
                Bandeau de souscription
              </Typography>
              <Typography sx={{ marginBottom: 2 }}>
                Réafficher le bandeau de souscription aux
                notifications pour tous les utilisateurs qui
                l'ont fermé.
              </Typography>
              <Button
                size="small"
                onClick={handleReset}
                disabled={loading}
              >
                Réactiver le bandeau
              </Button>
              {result && (
                <Box sx={{ marginTop: 2 }}>
                  <Alert
                    severity={result === "success" ? "success" : "error"}
                    title={
                      result === "success"
                        ? "Le bandeau a été réactivé pour tous les utilisateurs."
                        : "Une erreur est survenue."
                    }
                    small
                  />
                </Box>
              )}
            </Box>

            <Box
              sx={{
                padding: 3,
                borderTop: `1px solid ${fr.colors.decisions.border.default.grey.default}`
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: 2,
                  color:
                    fr.colors.decisions.text.title.grey.default
                }}
              >
                Campagnes de notifications
              </Typography>
              <Typography
                sx={{
                  color:
                    fr.colors.decisions.text.mention.grey.default
                }}
              >
                Fonctionnalité à venir.
              </Typography>
            </Box>
          </Container>
        </PaperContainer>
      </Main>
    </>
  );
}
