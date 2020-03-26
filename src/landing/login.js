import React from "react";
import { useHistory } from "react-router-dom";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import { useApi, LOGIN_MUTATION } from "../common/utils/api";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";
import Box from "@material-ui/core/Box";
import { LogosHeader } from "../common/components/LogosHeader";

export default function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();
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
      await storeSyncedWithLocalStorage.storeTokens({
        accessToken,
        refreshToken
      });
    } catch {
      setError("Identifiants de connection incorrects");
    }
    setLoading(false);
  };

  return [
    <LogosHeader key={1} />,
    <Container key={2} className="centered scrollable" maxWidth={false}>
      <form
        className="vertical-form centered"
        noValidate
        autoComplete="on"
        onSubmit={handleSubmit}
      >
        <Box my={4}>
          <Typography variant="h3">👋</Typography>
          <Typography variant="h3">Bienvenue sur MobiLIC !</Typography>
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
            setEmail(e.target.value);
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
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!email || !password || loading || !!error}
          >
            <span
              style={{ position: "relative", visibility: loading && "hidden" }}
            >
              Me connecter
            </span>
            {loading && (
              <CircularProgress
                style={{ position: "absolute" }}
                color="inherit"
                size="1rem"
              />
            )}
          </Button>
          <Box mt={2}>
            <Typography>
              Pas encore de compte ?{" "}
              <Link
                href="/"
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
