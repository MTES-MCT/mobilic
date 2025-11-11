import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { useApi } from "common/utils/api";
import { useHistory, useLocation } from "react-router-dom";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import SignupStepper from "./SignupStepper";
import { makeStyles } from "@mui/styles";
import Container from "@mui/material/Container";
import { LoadingButton } from "common/components/LoadingButton";
import { Section } from "../common/Section";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../common/Snackbar";
import { PaperContainerTitle } from "../common/PaperContainer";

import { CheckboxField } from "../common/CheckboxField";
import { EmailField } from "../common/EmailField";
import { captureSentryException } from "common/utils/sentry";
import TimezoneSelect from "../common/TimezoneSelect";
import { getClientTimezone } from "common/utils/timezones";
import { WayHeardOfMobilic } from "../common/WayHeardOfMobilic";
import { getPasswordErrors } from "common/utils/passwords";
import { PasswordInput } from "../common/forms/PasswordInput";
import { Stack } from "@mui/material";
import { HTTP_QUERIES } from "common/utils/apiQueries/httpQueries";
import { CONFIRM_FC_EMAIL_MUTATION } from "common/utils/apiQueries/loginSignup";

const useStyles = makeStyles((theme) => ({
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
  const [wayHeardOfMobilic, setWayHeardOfMobilic] = React.useState("");
  const [selectedTimezone, setSelectedTimezone] =
    React.useState(getClientTimezone());
  const [emailError, setEmailError] = React.useState("");
  const [origEmailSet, setOrigEmailSet] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [choosePassword, setChoosePassword] = React.useState(false);
  const [subscribeToNewsletter, setSubscribeToNewsletter] = React.useState(
    isAdmin ? true : false
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (store.hasAcceptedCgu()) {
      await _createLogin(
        email,
        choosePassword ? password : null,
        selectedTimezone.name,
        wayHeardOfMobilic
      );
    } else {
      modals.open("cgu", {
        handleAccept: async () =>
          await _createLogin(
            email,
            choosePassword ? password : null,
            selectedTimezone.name,
            wayHeardOfMobilic
          ),
        handleReject: () => {}
      });
    }
  };

  const _createLogin = async (email, password, timezone, wayHeardOfMobilic) => {
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        const payload = {
          email,
          timezoneName: timezone,
          wayHeardOfMobilic: wayHeardOfMobilic
        };
        if (password) payload.password = password;
        const apiResponse = await api.graphQlMutate(
          CONFIRM_FC_EMAIL_MUTATION,
          payload,
          { context: { nonPublicApi: true } }
        );
        if (subscribeToNewsletter) {
          try {
            await api.jsonHttpQuery(HTTP_QUERIES.subscribeToNewsletter, {
              json: { list: "employees" }
            });
          } catch (err) {
            captureSentryException(err);
          }
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
        <Stack direction="column" rowGap={4}>
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
            <EmailField
              required
              label="Adresse e-mail"
              value={email}
              setValue={setEmail}
              validate
              error={!!emailError}
              setError={setEmailError}
              showHint
            />
            {!isAdmin && (
              <CheckboxField
                checked={subscribeToNewsletter}
                onChange={() =>
                  setSubscribeToNewsletter(!subscribeToNewsletter)
                }
                label="En cochant cette case, j'accepte que mon adresse e-mail soit utilisée pour m'envoyer la lettre d'information Mobilic et pour me contacter en cas de besoin d'assistance technique."
              />
            )}
            {isAdmin && (
              <CheckboxField
                checked={!subscribeToNewsletter}
                onChange={() =>
                  setSubscribeToNewsletter(!subscribeToNewsletter)
                }
                label="Je m’oppose à ce que mon adresse e-mail soit utilisée pour recevoir la lettre d'information, les informations sur les nouvelles fonctionnalités et les dates de formation gestionnaire."
              />
            )}
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
            <CheckboxField
              checked={choosePassword}
              onChange={() => {
                if (choosePassword) setPassword("");
                setChoosePassword(!choosePassword);
              }}
              label="Choisir un mot de passe"
            />
            {choosePassword && (
              <PasswordInput
                label="Choisissez un mot de passe"
                nativeInputProps={{
                  autoComplete: "current-password",
                  value: password,
                  onChange: (e) => setPassword(e.target.value)
                }}
                displayMessages
                required
              />
            )}
          </Section>
          <Section title="3. Fuseau horaire">
            <Typography align="justify" className={classes.text}>
              Modifiez votre fuseau horaire si besoin.
            </Typography>
            <TimezoneSelect
              currentTimezone={selectedTimezone}
              setTimezone={setSelectedTimezone}
            />
          </Section>
          {isAdmin && (
            <Section title="4. Informations complémentaires">
              <WayHeardOfMobilic
                setWayHeardOfMobilicValue={setWayHeardOfMobilic}
              />
            </Section>
          )}
        </Stack>
        <Box my={4}>
          <LoadingButton
            type="submit"
            loading={loading}
            disabled={
              !!emailError ||
              !email ||
              (choosePassword && (!password || getPasswordErrors(password)))
            }
          >
            Continuer
          </LoadingButton>
        </Box>
      </form>
    </Container>
  );
}
