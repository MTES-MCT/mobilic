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
import { useApi, API_HOST } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { getFallbackRoute } from "../common/routes";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RESET_PUSH_OPT_IN_BANNER_MUTATION } from "common/utils/apiQueries/misc";
import { UPDATE_PUSH_BANNER_TEXT_MUTATION } from "common/utils/apiQueries/notificationCampaign";
import CampaignForm from "./CampaignForm";
import CampaignHistory from "./CampaignHistory";

const borderGrey = fr.colors.decisions.border.default.grey.default;
const mentionGrey = fr.colors.decisions.text.mention.grey.default;
const titleGrey = fr.colors.decisions.text.title.grey.default;

export default function NotificationsAdmin() {
  usePageTitle("Support - Notifications - Mobilic");
  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const history = useHistory();
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState(null);
  const [refreshKey, setRefreshKey] = React.useState(0);
  const [bannerText, setBannerText] = React.useState("");
  const [bannerLoading, setBannerLoading] = React.useState(false);
  const [bannerResult, setBannerResult] = React.useState(null);

  const userInfo = store.userInfo();
  const companies = store.companies();

  React.useEffect(() => {
    fetch(`${API_HOST}/vapid-public-key`)
      .then(res => res.json())
      .then(data => {
        if (data?.bannerText) setBannerText(data.bannerText);
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (
      userInfo?.id &&
      ((!userInfo?.admin && !userInfo?.bizdev) || !userInfo?.totpEnabled)
    ) {
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
          <Container maxWidth="lg">
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
                    titleGrey
                }}
              >
                Bandeau de souscription
              </Typography>
              <Input
                label="Texte affiché aux utilisateurs"
                textArea
                nativeTextAreaProps={{
                  value: bannerText,
                  onChange: e => setBannerText(e.target.value),
                  maxLength: 500,
                  rows: 2,
                  placeholder:
                    "Pour recevoir des informations de la part de Mobilic, cliquez sur le bouton suivant :"
                }}
              />
              <Button
                size="small"
                onClick={async () => {
                  setBannerLoading(true);
                  setBannerResult(null);
                  try {
                    await api.graphQlMutate(
                      UPDATE_PUSH_BANNER_TEXT_MUTATION,
                      { bannerText: bannerText.trim() },
                      { context: { nonPublicApi: true } }
                    );
                    setBannerResult("success");
                  } catch {
                    setBannerResult("error");
                  } finally {
                    setBannerLoading(false);
                  }
                }}
                disabled={!bannerText.trim() || bannerLoading}
              >
                Enregistrer
              </Button>
              {bannerResult && (
                <Box sx={{ marginTop: 2 }}>
                  <Alert
                    severity={bannerResult === "success" ? "success" : "error"}
                    title={
                      bannerResult === "success"
                        ? "Texte du bandeau mis à jour."
                        : "Une erreur est survenue."
                    }
                    small
                  />
                </Box>
              )}
              <Box
                sx={{
                  marginTop: 3,
                  paddingTop: 2,
                  borderTop: `1px solid ${borderGrey}`
                }}
              >
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Button
                    size="small"
                    priority="secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Réactiver le bandeau
                  </Button>
                  <Typography
                    variant="body2"
                    sx={{
                      color:
                        mentionGrey
                    }}
                  >
                    Réaffiche le bandeau pour les utilisateurs qui l'ont fermé
                  </Typography>
                </Box>
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
            </Box>

            <Box
              sx={{
                padding: 3,
                borderTop: `1px solid ${borderGrey}`
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: 2,
                  color:
                    titleGrey
                }}
              >
                Nouvelle campagne
              </Typography>
              <CampaignForm onCreated={() => setRefreshKey(k => k + 1)} />
            </Box>

            <Box
              sx={{
                padding: 3,
                borderTop: `1px solid ${borderGrey}`
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  marginBottom: 2,
                  color:
                    titleGrey
                }}
              >
                Campagnes
              </Typography>
              <CampaignHistory refreshKey={refreshKey} />
            </Box>
          </Container>
        </PaperContainer>
      </Main>
    </>
  );
}
