import React from "react";
import { useHistory } from "react-router-dom";
import Container from "@mui/material/Container";
import { useApi } from "common/utils/api";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import Box from "@mui/material/Box";
import { LoadingButton } from "common/components/LoadingButton";
import { Header } from "../common/Header";
import { graphQLErrorMatchesCode } from "common/utils/errors";
import {
  buildCallbackUrl,
  buildFranceConnectUrl
} from "common/utils/franceConnect";
import { FranceConnectContainer } from "../common/FranceConnect";
import { makeStyles } from "@mui/styles";
import { useSnackbarAlerts } from "../common/Snackbar";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { EmailField } from "../common/EmailField";
import { pluralize } from "common/utils/time";
import { usePageTitle } from "../common/UsePageTitle";
import { RegistrationLink } from "../common/RegistrationLink";
import { PasswordInput } from "../common/forms/PasswordInput";
import { Main } from "../common/semantics/Main";
import {
  LOGIN_MUTATION,
  VALIDATE_TOTP_LOGIN_MUTATION
} from "common/utils/apiQueries/loginSignup";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { OtpInput } from "../common/OtpInput";

const useStyles = makeStyles((theme) => ({
  forgotPasswordLink: {
    marginBottom: theme.spacing(2)
  },
  mainTitle: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2)
  },
  loginControllerButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(4)
  },
  errorMessage: {
    color: "red",
    fontSize: "0.85em"
  }
}));

export default function Login() {
  usePageTitle("Connexion Entreprise / Salarié - Mobilic");
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [totpStep, setTotpStep] = React.useState(false);
  const [challengeToken, setChallengeToken] = React.useState(null);
  const [totpCode, setTotpCode] = React.useState("");
  const totpSubmittingRef = React.useRef(false);

  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();
  const history = useHistory();
  const classes = useStyles();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        const response = await api.graphQlMutate(
          LOGIN_MUTATION,
          {
            email,
            password
          },
          {},
          true
        );
        const loginResult = response.data.auth.login;
        if (loginResult.totpRequired) {
          setChallengeToken(loginResult.accessToken);
          setTotpStep(true);
          return;
        }
        await store.updateUserIdAndInfo();
      },
      "login",
      (graphQLError) => {
        if (graphQLErrorMatchesCode(graphQLError, "AUTHENTICATION_ERROR")) {
          return "Identifiants incorrects.";
        }
        if (graphQLErrorMatchesCode(graphQLError, "BAD_PASSWORD_ERROR")) {
          const { nb_bad_tries, max_possible_tries } = graphQLError.extensions;
          const displayErrorMessage = nb_bad_tries * 2 >= max_possible_tries;
          if (displayErrorMessage) {
            setErrorMessage(
              `Attention, il vous reste ${pluralize(
                max_possible_tries - nb_bad_tries,
                "tentative"
              )} avant que votre compte ne soit bloqué`
            );
          }
          return "Identifiants incorrects.";
        }
        if (graphQLErrorMatchesCode(graphQLError, "BLOCKED_ACCOUNT_ERROR")) {
          setErrorMessage(
            "Vous avez épuisé vos tentatives de connexion. Nous vous avons envoyé un mail afin que vous puissiez réinitialiser votre mot de passe, et ainsi débloquer votre compte."
          );
          return "Votre compte est bloqué.";
        }
      }
    );
    setLoading(false);
  };

  const handleTotpSubmit = async (e, code) => {
    if (e) e.preventDefault();
    const codeToValidate = code || totpCode;
    if (codeToValidate.length !== 6 || loading || totpSubmittingRef.current)
      return;
    totpSubmittingRef.current = true;
    setErrorMessage(null);
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        await api.graphQlMutate(
          VALIDATE_TOTP_LOGIN_MUTATION,
          { code: codeToValidate },
          {
            context: {
              headers: { Authorization: `Bearer ${challengeToken}` }
            }
          },
          true
        );
        await store.updateUserIdAndInfo();
      },
      "login",
      (graphQLError) => {
        setLoading(false);
        totpSubmittingRef.current = false;
        if (graphQLErrorMatchesCode(graphQLError, "AUTHENTICATION_ERROR")) {
          setTotpCode("");
          return "Code de vérification invalide ou expiré.";
        }
        if (graphQLErrorMatchesCode(graphQLError, "BLOCKED_ACCOUNT_ERROR")) {
          setTotpStep(false);
          setChallengeToken(null);
          setTotpCode("");
          setErrorMessage(
            "Trop de tentatives. Veuillez vous reconnecter."
          );
          return "Compte temporairement bloqué.";
        }
      }
    );
  };

  if (totpStep) {
    return (
      <>
        <Header />
        <Main>
          <PaperContainer>
            <Container className="centered" maxWidth="xs">
              <PaperContainerTitle variant="h1" className={classes.mainTitle}>
                Connexion
              </PaperContainerTitle>
              <Stepper
                currentStep={2}
                stepCount={2}
                title="Vérification en deux étapes"
              />
              <Typography variant="body1" sx={{ mb: 3 }}>
                Saisissez le code à 6 chiffres généré par votre application
                d'authentification (Google Authenticator, Authy,
                Bitwarden…).
              </Typography>
              <form
                className="vertical-form"
                noValidate
                onSubmit={handleTotpSubmit}
              >
                <Input
                  label="Code de vérification"
                  nativeInputProps={{
                    inputMode: "numeric",
                    autoComplete: "one-time-code",
                    maxLength: 6,
                    value: totpCode,
                    onChange: (e) =>
                      setTotpCode(e.target.value.replace(/\D/g, ""))
                  }}
                />
                <Box my={2}>
                  <LoadingButton
                    aria-label="Valider le code"
                    type="submit"
                    loading={loading}
                    disabled={totpCode.length !== 6}
                  >
                    Valider
                  </LoadingButton>
                </Box>
                {errorMessage && (
                  <Box>
                    <Typography className={classes.errorMessage}>
                      {errorMessage}
                    </Typography>
                  )}
                  {errorMessage && (
                    <div
                      className="fr-error-text fr-mt-2w"
                      role="alert"
                    >
                      {errorMessage}
                    </div>
                  )}
                  <Box mt={5}>
                    <Link
                      component="button"
                      type="button"
                      onClick={() => {
                        setTotpStep(false);
                        setChallengeToken(null);
                        setTotpCode("");
                        setErrorMessage(null);
                      }}
                    >
                      Retour à la connexion
                    </Link>
                  </Box>
                </form>
              </Box>
            </Container>
          </PaperContainer>
        </Main>
      </>
    );
  }

  return (
    <>
      <Header />
      <Main>
        <PaperContainer>
          <Container className="centered" maxWidth="xs">
            <PaperContainerTitle variant="h1" className={classes.mainTitle}>
              Connexion
            </PaperContainerTitle>
            <PaperContainerTitle variant="h3">
              Entreprise ou salarié
            </PaperContainerTitle>
            <FranceConnectContainer
              onButtonClick={() => {
                const callbackUrl = buildCallbackUrl();
                window.location.href = buildFranceConnectUrl(callbackUrl);
              }}
            />
            <p className="fr-hr-or">ou</p>
            <Box my={1}>
              <form
                className="vertical-form"
                autoComplete="on"
                noValidate
                onSubmit={handleSubmit}
              >
                <EmailField
                  autoComplete="username"
                  value={email}
                  setValue={setEmail}
                  error={emailError}
                  setError={setEmailError}
                  required
                />
                <PasswordInput
                  label="Mot de passe"
                  nativeInputProps={{
                    autoComplete: "current-password",
                    value: password,
                    onChange: (e) => setPassword(e.target.value)
                  }}
                  required
                />
                <Box my={2}>
                  <LoadingButton
                    aria-label="Connexion"
                    type="submit"
                    loading={loading}
                    disabled={!email || !password}
                  >
                    Me connecter
                  </LoadingButton>
                </Box>
                {errorMessage && (
                  <Box>
                    <Typography className={classes.errorMessage}>
                      {errorMessage}
                    </Typography>
                  </Box>
                )}
                <Box mt={5}>
                  <Typography className={classes.forgotPasswordLink}>
                    <Link
                      href="/request_reset_password"
                      onClick={(e) => {
                        e.preventDefault();
                        history.push("/request_reset_password");
                      }}
                    >
                      J'ai oublié mon mot de passe <br />
                      Je n'ai pas de mot de passe
                    </Link>
                  </Typography>
                  <RegistrationLink />
                </Box>
              </form>
            </Box>
          </Container>
        </PaperContainer>
      </Main>
    </>
  );
}
