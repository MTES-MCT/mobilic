import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import { CONFIRM_FC_EMAIL_MUTATION, useApi } from "common/utils/api";
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
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";

const useStyles = makeStyles(theme => ({
  title: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    textAlign: "center"
  },
  text: {
    paddingBottom: theme.spacing(2)
  }
}));

export function EmailSelection() {
  const classes = useStyles();

  const api = useApi();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();

  const userInfo = store.userInfo();
  const modals = useModals();

  React.useEffect(() => store.setIsSigningUp(), []);

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [origEmailSet, setOrigEmailSet] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [choosePassword, setChoosePassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const location = useLocation();

  React.useEffect(() => {
    // Just do it once
    if (!origEmailSet && userInfo.email) {
      setEmail(userInfo.email);
      setOrigEmailSet(true);
    }
  }, [userInfo]);

  React.useEffect(() => {
    const queryString = new URLSearchParams(location.search);
    const admin = queryString.get("admin");
    setIsAdmin(!!admin);
  }, [location]);

  const handleSubmit = e => {
    e.preventDefault();
    modals.open("cgu", {
      handleAccept: async () =>
        await _createLogin(email, choosePassword ? password : null),
      handleReject: () => {}
    });
  };

  const _createLogin = async (email, password) => {
    setLoading(true);
    try {
      const payload = {
        email
      };
      if (password) payload.password = password;
      const apiResponse = await api.graphQlMutate(
        CONFIRM_FC_EMAIL_MUTATION,
        payload,
        { context: { nonPublicApi: true } }
      );

      store.setUserInfo({
        ...userInfo,
        ...apiResponse.data.signUp.confirmFcEmail
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

  const origEmail = userInfo.email;

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
            {origEmail
              ? "Confirmation de l'adresse email"
              : "Choix de l'adresse email"}
          </Typography>
          <form
            className="vertical-form centered"
            noValidate
            autoComplete="off"
            onSubmit={handleSubmit}
          >
            <Section title="1. Adresse email">
              <Typography align="left" className={classes.text}>
                <span className="bold">{userInfo.firstName}</span>, veuillez{" "}
                {origEmail ? (
                  <>
                    confirmer votre adresse email{" "}
                    <span className="bold">{userInfo.email}</span>
                  </>
                ) : (
                  "renseigner votre adresse email"
                )}
              </Typography>
              <Typography align="left" className={classes.text}>
                Mobilic se servira de cette adresse comme point de contact
                uniquement pour vous communiquer des informations indispensables
                au bon fonctionnement du service.
              </Typography>
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
            </Section>
            <Section title="2. Mot de passe (facultatif)">
              <Typography align="left" className={classes.text}>
                Vous pouvez également choisir un mot de passe de connexion si
                vous le souhaitez. Cela vous permettra de vous connecter de
                manière directe en plus de la connexion via FranceConnect.
              </Typography>
              <Typography align="left" className={classes.text}>
                Le nom d'utilisateur associé sera l'adresse email renseignée
                ci-dessus.
              </Typography>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={choosePassword}
                      onChange={() => {
                        if (choosePassword) setPassword("");
                        setChoosePassword(!choosePassword);
                      }}
                    />
                  }
                  label="Choisir un mot de passe"
                />
              </FormGroup>
              {choosePassword && (
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
              )}
            </Section>
            <Box mt={4} mb={8}>
              <LoadingButton
                variant="contained"
                color="primary"
                type="submit"
                loading={loading}
                disabled={
                  !email || (choosePassword && !password) || loading || !!error
                }
              >
                Continuer
              </LoadingButton>
              {error && <Typography color="error">{error}</Typography>}
            </Box>
          </form>
        </Container>
      </Paper>
    </>
  );
}
