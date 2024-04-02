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
import { PasswordField } from "common/components/PasswordField";
import { makeStyles } from "@mui/styles";
import { useSnackbarAlerts } from "../common/Snackbar";
import { PaperContainer, PaperContainerTitle } from "../common/PaperContainer";
import { LOGIN_MUTATION } from "common/utils/apiQueries";
import { EmailField } from "../common/EmailField";
import { pluralize } from "common/utils/time";
import { usePageTitle } from "../common/UsePageTitle";
import { RegistrationLink } from "../common/RegistrationLink";

const useStyles = makeStyles(theme => ({
  forgotPasswordLink: {
    marginBottom: theme.spacing(2)
  },
  dividerAgentConnect: {
    borderBottomColor: theme.palette.primary.main,
    color: theme.palette.primary.main
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
  const [errorMessage, setErrorMessage] = React.useState(null);
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();
  const history = useHistory();
  const classes = useStyles();

  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        await api.graphQlMutate(
          LOGIN_MUTATION,
          {
            email,
            password
          },
          {},
          true
        );
        await store.updateUserIdAndInfo();
      },
      "login",
      graphQLError => {
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

  return [
    <Header key={1} />,
    <PaperContainer key={2}>
      <Container className="centered" maxWidth="xs">
        <PaperContainerTitle variant="h1" className={classes.mainTitle}>
          Connexion
        </PaperContainerTitle>
        <PaperContainerTitle variant="h3">
          Entreprise ou salarié
        </PaperContainerTitle>
        <FranceConnectContainer
          mt={2}
          mb={3}
          onButtonClick={() => {
            const callbackUrl = buildCallbackUrl();
            window.location.href = buildFranceConnectUrl(callbackUrl);
          }}
          helperText="FranceConnect est la solution proposée par l’État pour simplifier la connexion à vos services en ligne. Vous pouvez vous connecter à votre compte via FranceConnect."
        />
        <Typography>ou</Typography>
        <Box my={1}>
          <form
            className="vertical-form"
            autoComplete="on"
            noValidate
            onSubmit={handleSubmit}
          >
            <EmailField
              fullWidth
              className="vertical-form-text-input"
              label="Email"
              autoComplete="username"
              value={email}
              setValue={setEmail}
              required
            />
            <PasswordField
              fullWidth
              className="vertical-form-text-input"
              label="Mot de passe"
              variant="standard"
              autoComplete="current-password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
              required
            />
            <Box my={2}>
              <LoadingButton
                aria-label="Connexion"
                variant="contained"
                color="primary"
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
                  onClick={e => {
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
  ];
}
