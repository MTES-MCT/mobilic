import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import { useApi } from "common/utils/api";
import { useHistory, useLocation } from "react-router-dom";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/utils/store";
import SignupStepper from "./SignupStepper";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Container from "@material-ui/core/Container";
import { LoadingButton } from "common/components/LoadingButton";
import { Section } from "../../common/Section";
import { useModals } from "common/utils/modals";
import Checkbox from "@material-ui/core/Checkbox/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import FormGroup from "@material-ui/core/FormGroup";
import { PasswordField } from "common/components/PasswordField";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { CONFIRM_FC_EMAIL_MUTATION } from "common/utils/apiQueries";

const useStyles = makeStyles(theme => ({
  text: {
    paddingBottom: theme.spacing(2)
  }
}));

export function EmailSelection() {
  const classes = useStyles();

  const api = useApi();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();
  const alerts = useSnackbarAlerts();

  const userInfo = store.userInfo();
  const modals = useModals();

  const [isAdmin, setIsAdmin] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [origEmailSet, setOrigEmailSet] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [choosePassword, setChoosePassword] = React.useState(false);
  const [subscribeToNewsletter, setSubscribeToNewsletter] = React.useState(
    true
  );
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

  const handleSubmit = async e => {
    e.preventDefault();
    if (store.hasAcceptedCgu()) {
      await _createLogin(email, choosePassword ? password : null);
    } else {
      modals.open("cgu", {
        handleAccept: async () =>
          await _createLogin(email, choosePassword ? password : null),
        handleReject: () => {}
      });
    }
  };

  const _createLogin = async (email, password) => {
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        const payload = {
          email
        };
        if (password) payload.password = password;
        const apiResponse = await api.graphQlMutate(
          CONFIRM_FC_EMAIL_MUTATION,
          payload,
          { context: { nonPublicApi: true } }
        );
        if (subscribeToNewsletter) {
          await api.httpQuery("POST", "/contacts/subscribe_to_newsletter", {
            json: { list: "employees" }
          });
        }
        await store.setUserInfo({
          ...userInfo,
          ...apiResponse.data.signUp.confirmFcEmail
        });
        await broadCastChannel.postMessage("update");
        if (isAdmin) history.push("/signup/company?onboarding=true");
        else history.push("/signup/complete");
      },
      "select-email",
      null,
      () => {
        setEmail("");
        setPassword("");
      }
    );
    setLoading(false);
  };

  const origEmail = userInfo.email;

  return (
    <Container className="centered" maxWidth="sm">
      {<SignupStepper activeStep={0} />}
      <PaperContainerTitle>
        {origEmail
          ? "Confirmation de l'adresse email"
          : "Choix de l'adresse email"}
      </PaperContainerTitle>
      <form
        className="vertical-form centered"
        autoComplete="off"
        onSubmit={handleSubmit}
      >
        <Section title="1. Adresse email">
          <Typography align="justify" className={classes.text}>
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
          <Typography align="justify" className={classes.text}>
            Par défaut Mobilic se servira de cette adresse comme point de
            contact uniquement pour vous communiquer des informations
            indispensables au bon fonctionnement du service.
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
              setEmail(e.target.value.replace(/\s/g, ""));
            }}
          />
          <FormGroup style={{ marginTop: 16, marginBottom: 32 }}>
            <FormControlLabel
              style={{ alignItems: "flex-start", textAlign: "left" }}
              control={
                <Checkbox
                  required
                  color="primary"
                  style={{ paddingTop: 0 }}
                  checked={subscribeToNewsletter}
                  onChange={() =>
                    setSubscribeToNewsletter(!subscribeToNewsletter)
                  }
                />
              }
              label={`Je souhaite m'inscrire à la newsletter Mobilic pour rester informé par mail des dernières évolutions du produit.`}
            />
          </FormGroup>
        </Section>
        <Section title="2. Mot de passe (facultatif)">
          <Typography align="justify" className={classes.text}>
            Vous pouvez également choisir un mot de passe de connexion si vous
            le souhaitez. Cela vous permettra de vous connecter de manière
            directe en plus de la connexion via FranceConnect.
          </Typography>
          <Typography align="justify" className={classes.text}>
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
            <PasswordField
              reuired
              fullWidth
              className="vertical-form-text-input"
              label="Choisissez un mot de passe"
              autoComplete="current-password"
              value={password}
              onChange={e => {
                setPassword(e.target.value);
              }}
            />
          )}
        </Section>
        <Box my={4}>
          <LoadingButton
            aria-label="Continuer"
            variant="contained"
            color="primary"
            type="submit"
            loading={loading}
            disabled={!email || (choosePassword && !password)}
          >
            Continuer
          </LoadingButton>
        </Box>
      </form>
    </Container>
  );
}
