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
import { FranceConnectIcon } from "common/utils/icons";
import Button from "@material-ui/core/Button";

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

  return [
    <Header key={1} />,
    <Container key={2} className="centered scrollable" maxWidth="xs">
      <form
        className="vertical-form centered"
        noValidate
        autoComplete="on"
        onSubmit={handleSubmit}
      >
        <Box my={4}>
          <Typography variant="h3">Connexion</Typography>
        </Box>
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
        <Box mt={4} mb={8}>
          <LoadingButton
            variant="contained"
            color="primary"
            type="submit"
            loading={loading}
            disabled={!email || !password}
          >
            Me connecter
          </LoadingButton>
          <Box my={6}>
            <Typography>ou me connecter via France Connect</Typography>
            <Button
              onClick={() => {
                const callbackUrl = buildCallbackUrl();
                window.location.href = buildFranceConnectUrl(callbackUrl);
              }}
            >
              <FranceConnectIcon scale={0.5} />
            </Button>
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
        </Box>
      </form>
    </Container>
  ];
}
