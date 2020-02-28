import React from "react";
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
import { loadUserData } from "../common/utils/loadUserData";

export default function Login({ setSignUpInsteadOfLogging }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const api = useApi();
  const storeSyncedWithLocalStorage = useStoreSyncedWithLocalStorage();

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
      loadUserData(api, storeSyncedWithLocalStorage);
    } catch {
      setError("Identifiants de connection incorrects");
    }
    setLoading(false);
  };

  return (
    <Container className="landing-container scrollable" maxWidth={false}>
      <LogosHeader />
      <form
        className="vertical-form centered-with-margin"
        noValidate
        autoComplete="on"
        onSubmit={handleSubmit}
      >
        <Box my={4}>
          <Typography variant="h4">👋</Typography>
          <Typography style={{ fontWeight: "bold" }}>
            Bienvenue sur MobiLIC !
          </Typography>
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
                  setSignUpInsteadOfLogging(true);
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
  );
}
