import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import { CREATE_LOGIN_MUTATION, useApi } from "common/utils/api";
import { useHistory, useLocation } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import Paper from "@material-ui/core/Paper";
import SignupStepper from "./SignupStepper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { formatApiError } from "common/utils/errors";
import { LoadingButton } from "common/components/LoadingButton";
import { Section } from "../../common/Section";
import { useModals } from "common/utils/modals";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "center"
  }
}));

export function EmailSelection() {
  const classes = useStyles();

  const api = useApi();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();

  React.useEffect(() => store.setIsSigningUp(), []);

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const location = useLocation();

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const admin = queryString.get("admin");
    setIsAdmin(!!admin);
  }, [location]);

  const handleSubmit = e => {
    e.preventDefault();
    modals.open("cgu", {
      handleAccept: async () => await _createLogin(email, password),
      handleReject: () => {}
    });
  };

  const _createLogin = async (email, password) => {
    setLoading(true);
    try {
      const payload = {
        email,
        password
      };
      const apiResponse = await api.graphQlMutate(
        CREATE_LOGIN_MUTATION,
        payload,
        { context: { nonPublicApi: true } }
      );

      store.setUserInfo({
        ...store.userInfo(),
        email: apiResponse.data.signUp.createLogin.email
      });
      if (isAdmin) history.push("/signup/company");
      else history.push("/signup/complete");
    } catch (err) {
      setEmail("");
      setPassword("");
      setError(formatApiError(err));
    }
    setLoading(false);
  };

  return (
    <>
      {isAdmin && (
        <Paper key={0}>
          <SignupStepper activeStep={0} />
        </Paper>
      )}
      <Paper key={1}>
        <Container className="centered" maxWidth="sm">
          <Typography className={classes.title} variant="h3">
            Choix des identifiants
          </Typography>

          <Section>
            <Typography align="left">
              <span className="bold">{store.userInfo().firstName}</span>,
              veuillez choisir une adresse e-mail de connexion et un mot de
              passe pour finaliser votre création de compte
            </Typography>
            <form
              className="vertical-form centered"
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
            >
              <TextField
                required
                fullWidth
                className="vertical-form-text-input"
                label="Adresse e-mail"
                type="email"
                autoComplete="username"
                value={email}
                onChange={e => {
                  setError("");
                  setEmail(e.target.value.replace(/\s/g, ""));
                }}
              />
              <TextField
                required
                fullWidth
                className="vertical-form-text-input"
                label="Choisissez un mot de passe"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => {
                  setError("");
                  setPassword(e.target.value);
                }}
              />
              <Box mt={4} mb={8}>
                <LoadingButton
                  variant="contained"
                  color="primary"
                  type="submit"
                  loading={loading}
                  disabled={!email || !password || loading || !!error}
                >
                  Continuer
                </LoadingButton>
                {error && <Typography color="error">{error}</Typography>}
              </Box>
            </form>
          </Section>
        </Container>
      </Paper>
    </>
  );
}
