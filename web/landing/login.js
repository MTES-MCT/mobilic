import React from "react";
import { useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import { useApi, LOGIN_MUTATION } from "common/utils/api";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import Box from "@material-ui/core/Box";
import { LoadingButton } from "common/components/LoadingButton";
import { Header } from "../common/Header";
import { formatApiError } from "common/utils/errors";
import {
  buildCallbackUrl,
  buildFranceConnectUrl
} from "common/utils/franceConnect";
import { FranceConnectContainer } from "../common/FranceConnect";
import makeStyles from "@material-ui/core/styles/makeStyles";
import { ScrollableContainer } from "common/utils/scroll";

const useStyles = makeStyles(theme => ({
  container: {
    paddingBottom: theme.spacing(10)
  }
}));

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const api = useApi();
  const store = useStoreSyncedWithLocalStorage();
  const history = useHistory();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginResponse = await api.graphQlMutate(LOGIN_MUTATION, {
        email,
        password
      });
      const { accessToken, refreshToken } = loginResponse.data.auth.login;
      await store.storeTokens({
        accessToken,
        refreshToken
      });
    } catch (error) {
      setError(formatApiError(error));
    }
    setLoading(false);
  };

  const classes = useStyles();

  return [
    <Header key={1} />,
    <ScrollableContainer key={2}>
      <Container className={`centered ${classes.container}`} maxWidth="xs">
        <Box my={4}>
          <Typography variant="h3">Connexion</Typography>
        </Box>
        <FranceConnectContainer
          mt={6}
          mb={3}
          onButtonClick={() => {
            const callbackUrl = buildCallbackUrl();
            window.location.href = buildFranceConnectUrl(callbackUrl);
          }}
          helperText="FranceConnect est la solution proposée par l’État pour simplifier la connexion à vos services en ligne. Vous pouvez vous connecter à votre compte via FranceConnect."
        />
        <Typography>ou</Typography>
        <Box my={3}>
          <form
            className="vertical-form"
            noValidate
            autoComplete="on"
            onSubmit={handleSubmit}
          >
            <TextField
              fullWidth
              className="vertical-form-text-input"
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={e => {
                setError("");
                setEmail(e.target.value.replace(/\s/g, ""));
              }}
            />
            <TextField
              fullWidth
              className="vertical-form-text-input"
              label="Mot de passe"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => {
                setError("");
                setPassword(e.target.value);
              }}
            />
            {error && (
              <Typography align="left" color="error">
                {error}
              </Typography>
            )}

            <Box my={4}>
              <LoadingButton
                variant="contained"
                color="primary"
                type="submit"
                loading={loading}
                disabled={!email || !password}
              >
                Me connecter
              </LoadingButton>
            </Box>
            <Box mt={2}>
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
      </Container>
    </ScrollableContainer>
  ];
}
