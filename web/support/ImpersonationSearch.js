import React from "react";
import { useHistory } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { useApi } from "common/utils/api";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { useSnackbarAlerts } from "../common/Snackbar";
import { Header } from "../common/Header";
import { Main } from "../common/semantics/Main";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { usePageTitle } from "../common/UsePageTitle";
import { getFallbackRoute } from "../common/routes";
import {
  SEARCH_USERS_FOR_IMPERSONATION,
  START_IMPERSONATION_MUTATION
} from "common/utils/apiQueries/impersonation";

export default function ImpersonationSearch() {
  usePageTitle("Support - Impersonation - Mobilic");
  const [searchInput, setSearchInput] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [hasMore, setHasMore] = React.useState(false);
  const [searchDone, setSearchDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [impersonating, setImpersonating] = React.useState(false);

  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();
  const history = useHistory();

  const userInfo = store.userInfo();
  const companies = store.companies();

  React.useEffect(() => {
    if (userInfo?.id && (!userInfo?.admin || !userInfo?.totpEnabled)) {
      history.replace(
        getFallbackRoute({
          userInfo,
          companies,
          controllerInfo: store.controllerInfo()
        })
      );
    }
  }, [userInfo, companies, history, store]);

  const fetchResults = async (offset, append) => {
    const response = await api.graphQlQuery(
      SEARCH_USERS_FOR_IMPERSONATION,
      { search: searchInput, offset },
      { context: { nonPublicApi: true } }
    );
    const page = response.data.searchUsersForImpersonation;
    if (append) {
      setResults((prev) => [...prev, ...(page.results || [])]);
    } else {
      setResults(page.results || []);
    }
    setHasMore(page.hasMore);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (searchInput.length < 3) return;
    setLoading(true);
    setSearchDone(false);
    await alerts.withApiErrorHandling(async () => {
      await fetchResults(0, false);
      setSearchDone(true);
    }, "search-users");
    setLoading(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await alerts.withApiErrorHandling(async () => {
      await fetchResults(results.length, true);
    }, "search-users");
    setLoadingMore(false);
  };

  const handleImpersonate = async (userId) => {
    setImpersonating(true);
    try {
      await alerts.withApiErrorHandling(async () => {
        await api.graphQlMutate(
          START_IMPERSONATION_MUTATION,
          { userId },
          { context: { nonPublicApi: true } }
        );
        await store.updateUserIdAndInfo();
      }, "start-impersonation");
    } finally {
      setImpersonating(false);
    }
  };

  return (
    <>
      <Header />
      <Main>
        <PaperContainer>
          <Container maxWidth="md">
            <PaperContainerTitle variant="h1" sx={{ textAlign: "center" }}>
              Accès au compte
            </PaperContainerTitle>
            <Typography variant="body1" sx={{ mb: 3, textAlign: "center" }}>
              Recherchez un utilisateur par email, nom, prénom ou SIREN pour
              accéder à son compte.
            </Typography>
            <form onSubmit={handleSearch}>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Box sx={{ flex: 1, maxWidth: 500, "& .fr-input-group": { mb: 0 } }}>
                  <Input
                    label=""
                    nativeInputProps={{
                      placeholder:
                        "Email, nom, prénom ou SIREN (min. 3 caractères)",
                      value: searchInput,
                      onChange: (e) => setSearchInput(e.target.value)
                    }}
                  />
                </Box>
                <Button
                  type="submit"
                  disabled={searchInput.length < 3 || loading}
                >
                  {loading ? "Recherche…" : "Rechercher"}
                </Button>
              </Box>
            </form>
            {searchDone && results.length === 0 && (
              <Alert
                severity="info"
                title="Aucun résultat"
                description="Aucun utilisateur trouvé pour cette recherche."
                small
              />
            )}
            {results.length > 0 && (
              <Box sx={{ mt: 2, overflowX: "auto" }}>
                <Table
                  noCaption
                  bordered
                  headers={["Nom", "Email", "Entreprise (SIREN)", "Action"]}
                  data={results.map((user) => [
                    `${user.firstName} ${user.lastName}`,
                    user.email,
                    user.companies
                      .map((c) => `${c.name} (${c.siren || "—"})`)
                      .join(", ") || "—",
                    <Button
                      key={user.id}
                      size="small"
                      priority="secondary"
                      disabled={impersonating}
                      onClick={() => handleImpersonate(user.id)}
                    >
                      {impersonating ? "Connexion…" : "Accéder"}
                    </Button>
                  ])}
                />
                {hasMore && (
                  <Box sx={{ mt: 2, textAlign: "center" }}>
                    <Button
                      priority="secondary"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore
                        ? "Chargement…"
                        : "Charger plus de résultats"}
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Container>
        </PaperContainer>
      </Main>
    </>
  );
}
