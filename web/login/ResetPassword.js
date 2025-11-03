import React from "react";
import Container from "@mui/material/Container";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import { makeStyles } from "@mui/styles";
import { useHistory, useLocation } from "react-router-dom";
import { useApi } from "common/utils/api";
import Typography from "@mui/material/Typography";
import { LoadingButton } from "common/components/LoadingButton";
import Box from "@mui/material/Box";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import jwt_decode from "jwt-decode";
import Grid from "@mui/material/Grid";
import { useLoadingScreen } from "common/utils/loading";
import { Header } from "../common/Header";
import { useSnackbarAlerts } from "../common/Snackbar";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import {
  REQUEST_RESET_PASSWORD_MUTATION,
  RESET_PASSWORD_MUTATION
} from "common/utils/apiQueries";
import { EmailField } from "../common/EmailField";
import Emoji from "../common/Emoji";
import { NewPasswordBlock } from "../common/NewPasswordBlock";
import { getPasswordErrors } from "common/utils/passwords";
import { usePageTitle } from "../common/UsePageTitle";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Main } from "../common/semantics/Main";

const useStyles = makeStyles(theme => ({
  introText: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "justify"
  },
  submitText: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10)
  }
}));

export function ResetPassword() {
  usePageTitle("Réinitaliser Mot de Passe - Mobilic");
  const store = useStoreSyncedWithLocalStorage();
  const api = useApi();
  const location = useLocation();
  const history = useHistory();
  const classes = useStyles();
  const alerts = useSnackbarAlerts();
  const withLoadingScreen = useLoadingScreen();

  const [didSubmitForm, setDidSubmitForm] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordCopy, setPasswordCopy] = React.useState("");

  const [tokenError, setTokenError] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [token, setToken] = React.useState(null);

  const passwordError = password ? getPasswordErrors(password) : null;
  const passwordCopyError =
    passwordCopy && passwordCopy !== password
      ? "Le mot de passe n'est pas identique"
      : null;

  React.useEffect(() => {
    withLoadingScreen(async () => {
      const queryString = new URLSearchParams(location.search);
      const tok = queryString.get("token");
      setToken(tok);
      try {
        const decodedToken = jwt_decode(tok);
        // eslint-disable-next-line no-prototype-builtins
        if (!decodedToken.user_id || !decodedToken.hasOwnProperty("hash")) {
          throw Error;
        }
      } catch {
        setTokenError(
          "Le lien de réinitialisation du mot de passe est invalide."
        );
        return;
      }
      // Logout if another user is logged in
      await api.logout({
        postFCLogoutRedirect: `/logout?next=${encodeURIComponent(
          "/reset_password?token=" + tok
        )}`
      });
    });
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        await api.graphQlMutate(
          RESET_PASSWORD_MUTATION,
          { token, password },
          {
            context: { nonPublicApi: true }
          },
          true
        );
        await store.updateUserIdAndInfo();
        setDidSubmitForm(true);
      },
      "reset-password",
      gqlError => {
        if (graphQLErrorMatchesCode(gqlError, "INVALID_TOKEN")) {
          return "Le lien de réinitialisation est invalide.";
        }
        if (graphQLErrorMatchesCode(gqlError, "EXPIRED_TOKEN")) {
          return "Le lien de réinitialisation a expiré.";
        }
      }
    );
    setLoading(false);
  };

  return (
    <>
      <Header />
      <Main>
        <PaperContainer>
          {tokenError ? (
            <Typography color="error">{tokenError}</Typography>
          ) : (
            <Container className="centered" maxWidth="sm">
              {didSubmitForm ? (
                <Grid
                  style={{ marginTop: 0 }}
                  container
                  spacing={10}
                  direction="column"
                  alignItems="center"
                >
                  <Grid item xs={12}>
                    <Typography className={classes.title} variant="h1">
                      <Emoji emoji="🎉" ariaLabel="Succès" />
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography>
                      Votre mot de passe a bien été réinitialisé !
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      onClick={() => {
                        history.push("/home");
                      }}
                    >
                      Aller dans mon espace
                    </Button>
                  </Grid>
                </Grid>
              ) : (
                <>
                  <PaperContainerTitle>
                    Réinitialisation du mot de passe
                  </PaperContainerTitle>
                  <form
                    className="vertical-form centered"
                    autoComplete="off"
                    onSubmit={handleSubmit}
                  >
                    <NewPasswordBlock
                      label="Veuillez choisir un nouveau mot de passe."
                      password={password}
                      setPassword={setPassword}
                      passwordError={passwordError}
                      passwordCopy={passwordCopy}
                      setPasswordCopy={setPasswordCopy}
                      passwordCopyError={passwordCopyError}
                    />
                    <Box my={4}>
                      <LoadingButton
                        type="submit"
                        disabled={
                          !token ||
                          !password ||
                          !passwordCopy ||
                          !!passwordError ||
                          !!passwordCopyError
                        }
                        loading={loading}
                      >
                        Valider
                      </LoadingButton>
                    </Box>
                  </form>
                </>
              )}
            </Container>
          )}
        </PaperContainer>
      </Main>
    </>
  );
}

export function RequestResetPassword() {
  usePageTitle("Réinitialiser Mot de Passe - Mobilic");
  const classes = useStyles();
  const api = useApi();
  const alerts = useSnackbarAlerts();

  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [didSubmitForm, setDidSubmitForm] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    await alerts.withApiErrorHandling(async () => {
      const apiResponse = await api.graphQlMutate(
        REQUEST_RESET_PASSWORD_MUTATION,
        { mail: email },
        {
          context: { nonPublicApi: true }
        },
        true
      );
      if (!apiResponse.data.account.requestResetPassword.success) {
        throw Error;
      }
      setDidSubmitForm(true);
    }, "request-reset-password");
    setLoading(false);
  };

  return (
    <>
      <Header />
      <Main>
        <PaperContainer>
          <Container className="centered" maxWidth="sm">
            {didSubmitForm ? (
              <Typography className={classes.submitText}>
                Si l'adresse email <strong>{email}</strong> correspond à un
                compte Mobilic vous allez y recevoir un email pour réinitialiser
                votre mot de passe.
              </Typography>
            ) : (
              <>
                <PaperContainerTitle>
                  Demande de réinitialisation du mot de passe
                </PaperContainerTitle>
                <form
                  className="vertical-form centered"
                  autoComplete="off"
                  onSubmit={handleSubmit}
                >
                  <Typography className={classes.introText}>
                    Pour réinitialiser votre mot de passe veuillez entrer
                    l'adresse email avec laquelle vous vous êtes inscrit sur
                    Mobilic.
                  </Typography>
                  <EmailField
                    required
                    label="Adresse email de connexion"
                    value={email}
                    setValue={setEmail}
                    error={emailError}
                    setError={setEmailError}
                  />
                  <Box my={4}>
                    <LoadingButton
                      type="submit"
                      disabled={!!emailError || !email}
                      loading={loading}
                    >
                      Valider
                    </LoadingButton>
                  </Box>
                </form>
              </>
            )}
          </Container>
        </PaperContainer>
      </Main>
    </>
  );
}
