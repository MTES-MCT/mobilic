import React from "react";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import { api, LOGIN_MUTATION } from "./common/utils/api";
import Typography from "@material-ui/core/Typography";

export function Login() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const loginResponse = await api.graphQlMutate(LOGIN_MUTATION, {
        email,
        password
      });
      const { accessToken, refreshToken } = loginResponse.data.auth.login;
      api.saveTokens(accessToken, refreshToken);
    } catch {
      setError("Identifiants de connection incorrects");
    }
    setLoading(false);
  };

  return (
    <Container>
      <form
        className="login-form"
        noValidate
        autoComplete="on"
        onSubmit={handleSubmit}
      >
        <div className="login-form-inputs">
          <TextField
            className="login-form-text-input"
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
            className="login-form-text-input"
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => {
              setError("");
              setPassword(e.target.value);
            }}
          />
          {error && <Typography color="error">{error}</Typography>}
        </div>
        <Button
          className="login-form-button"
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
      </form>
    </Container>
  );
}
