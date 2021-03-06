import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField/TextField";
import { useApi } from "common/utils/api";
import { useHistory } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/utils/store";
import SignupStepper from "./SignupStepper";
import Container from "@material-ui/core/Container";
import { LoadingButton } from "common/components/LoadingButton";
import { Section } from "../../common/Section";
import {
  buildCallbackUrl,
  buildFranceConnectUrl
} from "common/utils/franceConnect";
import { FranceConnectContainer } from "../../common/FranceConnect";
import { useModals } from "common/utils/modals";
import { PasswordField } from "common/components/PasswordField";
import { useSnackbarAlerts } from "../../common/Snackbar";
import { PaperContainerTitle } from "../../common/PaperContainer";
import { USER_SIGNUP_MUTATION } from "common/utils/apiQueries";

export function AccountCreation({ employeeInvite, isAdmin }) {
  const api = useApi();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (store.hasAcceptedCgu()) {
      await _createAccount(
        employeeInvite,
        isAdmin,
        email,
        password,
        firstName,
        lastName
      );
    } else {
      modals.open("cgu", {
        handleAccept: async () =>
          await _createAccount(
            employeeInvite,
            isAdmin,
            email,
            password,
            firstName,
            lastName
          ),
        handleReject: () => {}
      });
    }
  };

  const _createAccount = async (
    employeeInvite,
    isAdmin,
    email,
    password,
    firstName,
    lastName
  ) => {
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        const signupPayload = {
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim()
        };
        if (employeeInvite) {
          signupPayload.inviteToken = employeeInvite.inviteToken;
        }
        await api.graphQlMutate(USER_SIGNUP_MUTATION, signupPayload, {
          context: { nonPublicApi: true }
        });
        await store.updateUserIdAndInfo();
        if (isAdmin) history.push("/signup/company?onboarding=true");
        else history.push("/signup/complete");
      },
      "signup",
      null,
      () => {
        setEmail("");
        setPassword("");
      }
    );
    setLoading(false);
  };

  return (
    <Container className="centered" maxWidth="sm">
      {isAdmin && <SignupStepper activeStep={0} />}
      <PaperContainerTitle>Création de compte</PaperContainerTitle>
      {employeeInvite && employeeInvite.company && (
        <Typography align="justify">
          Vous avez été invité(e) par{" "}
          <span style={{ fontWeight: "bold" }}>
            {employeeInvite.company.name}
          </span>{" "}
          à créer un compte
        </Typography>
      )}
      <Section title="via FranceConnect">
        <FranceConnectContainer
          onButtonClick={() => {
            const callbackUrl = buildCallbackUrl(employeeInvite, true, isAdmin);
            window.location.href = buildFranceConnectUrl(callbackUrl);
          }}
          helperText="FranceConnect est la solution proposée par l’État pour sécuriser
              et simplifier la connexion à vos services en ligne."
        />
      </Section>

      <Section last title="ou via le formulaire d'inscription">
        <form
          className="vertical-form centered"
          autoComplete="off"
          onSubmit={handleSubmit}
        >
          <TextField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={e => {
              setEmail(e.target.value.replace(/\s/g, ""));
            }}
          />
          <PasswordField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Choisissez un mot de passe"
            autoComplete="current-password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
          />
          <TextField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Prénom"
            autoComplete="given-name"
            value={firstName}
            onChange={e => {
              setFirstName(e.target.value.trimLeft());
            }}
          />
          <TextField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Nom"
            autoComplete="family-name"
            value={lastName}
            onChange={e => {
              setLastName(e.target.value.trimLeft());
            }}
          />
          <Box my={4}>
            <LoadingButton
              aria-label="Inscription"
              variant="contained"
              color="primary"
              type="submit"
              disabled={!email || !password || !firstName || !lastName}
              loading={loading}
            >
              M'inscrire
            </LoadingButton>
          </Box>
        </form>
      </Section>
    </Container>
  );
}
