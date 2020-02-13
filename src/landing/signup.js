import React from "react";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "@material-ui/core/Button";
import { useApi, USER_SIGNUP_MUTATION } from "../common/utils/api";
import Typography from "@material-ui/core/Typography";
import { useLocalStorage } from "../common/utils/storage";

export default function Signup() {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const api = useApi();
  const localStorageContext = useLocalStorage();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const signUpResponse = await api.graphQlMutate(USER_SIGNUP_MUTATION, {
        email,
        password,
        firstName,
        lastName,
        companyName
      });
      const { accessToken, refreshToken } = signUpResponse.data.signupUser;
      localStorageContext.storeTokens({ accessToken, refreshToken });
    } catch (err) {
      setEmail("");
      setPassword("");
      setError("Problème imprévu ! Veuillez nous contacter");
    }
    setLoading(false);
  };

  return (
    <Container className="landing-container">
      <Typography variant="h6">Création de compte</Typography>
      <form
        className="landing-form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <div className="landing-form-inputs">
          <TextField
            fullWidth
            className="landing-form-text-input"
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
            className="landing-form-text-input"
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={e => {
              setError("");
              setPassword(e.target.value);
            }}
          />
          <TextField
            fullWidth
            className="landing-form-text-input"
            label="Prénom"
            autoComplete="given-name"
            value={firstName}
            onChange={e => {
              setError("");
              setFirstName(e.target.value);
            }}
          />
          <TextField
            fullWidth
            className="landing-form-text-input"
            label="Nom"
            autoComplete="family-name"
            value={lastName}
            onChange={e => {
              setError("");
              setLastName(e.target.value);
            }}
          />
          <TextField
            fullWidth
            className="landing-form-text-input"
            label="Entreprise"
            autoComplete="organization"
            value={companyName}
            onChange={e => {
              setError("");
              setCompanyName(e.target.value);
            }}
          />
          {error && <Typography color="error">{error}</Typography>}
        </div>
        <Button
          className="login-form-button"
          variant="contained"
          color="primary"
          type="submit"
          disabled={
            !email ||
            !password ||
            !firstName ||
            !lastName ||
            !companyName ||
            loading ||
            !!error
          }
        >
          <span
            style={{ position: "relative", visibility: loading && "hidden" }}
          >
            S'inscrire
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
