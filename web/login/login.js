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
import { DividerWithText } from "../common/DividerWithText";
import Button from "@mui/material/Button";

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
  }
}));

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();
  const history = useHistory();
  const classes = useStyles();

  const handleSubmit = async e => {
    e.preventDefault();
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
          Connexion Entreprises et Salariés
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
              <Typography>
                Pas encore de compte ?{" "}
                <Link
                  href="/signup"
                  onClick={e => {
                    e.preventDefault();
                    history.push("/signup");
                  }}
                >
                  {" "}
                  Je m'inscris
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
        {process.env.REACT_APP_SHOW_CONTROLLER_APP === "1" && (
          <>
            <DividerWithText className={classes.dividerAgentConnect}>
              OU
            </DividerWithText>
            <PaperContainerTitle variant="h3">
              Connexion Contrôleurs
            </PaperContainerTitle>
            <Typography paragraph={true}>
              Vous êtes Agent public de l'Etat ?
            </Typography>
            <Button
              aria-label="Connexion contrôleur"
              value="/controller-login"
              variant="contained"
              href="/controller-login"
              onClick={e => {
                e.preventDefault();
                history.push("/controller-login");
              }}
              className={classes.loginControllerButton}
            >
              Je me connecte à mon espace dédié
            </Button>
          </>
        )}
      </Container>
    </PaperContainer>
  ];
}
