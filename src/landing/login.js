import React from "react";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import { useApi, LOGIN_MUTATION } from "../common/utils/api";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import { PlaceHolder } from "../common/components/PlaceHolder";
import { useStoreSyncedWithLocalStorage } from "../common/utils/store";
import Box from "@material-ui/core/Box";

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
      storeSyncedWithLocalStorage.storeTokens({ accessToken, refreshToken });
    } catch {
      setError("Identifiants de connection incorrects");
    }
    setLoading(false);
  };

  return (
    <Container className="landing-container scrollable">
      <Box m={4}>
        <Typography variant="h4">👋</Typography>
        <Typography style={{ fontWeight: "bold" }}>
          Bienvenue sur MobiLIC !
        </Typography>
      </Box>
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
        <Box m={4}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={!email || !password || loading || !!error}
          >
            <span
              style={{ position: "relative", visibility: loading && "hidden" }}
            >
              Se connecter
            </span>
            {loading && (
              <CircularProgress
                style={{ position: "absolute" }}
                color="inherit"
                size="1rem"
              />
            )}
          </Button>
          <Typography style={{ marginTop: "2vh" }}>
            Pas encore de compte ?{" "}
            <Link
              href="/"
              onClick={e => {
                e.preventDefault();
                setSignUpInsteadOfLogging(true);
              }}
            >
              {" "}
              Inscrivez-vous
            </Link>
          </Typography>
        </Box>
      </form>
    </Container>
  );
}
