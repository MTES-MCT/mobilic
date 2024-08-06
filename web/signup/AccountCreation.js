import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { useApi } from "common/utils/api";
import { useHistory } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import SignupStepper from "./SignupStepper";
import Container from "@mui/material/Container";
import { LoadingButton } from "common/components/LoadingButton";
import { Section } from "../common/Section";
import {
  buildCallbackUrl,
  buildFranceConnectUrl
} from "common/utils/franceConnect";
import { FranceConnectContainer } from "../common/FranceConnect";
import { useModals } from "common/utils/modals";
import { PasswordField } from "common/components/PasswordField";
import { useSnackbarAlerts } from "../common/Snackbar";
import { PaperContainerTitle } from "../common/PaperContainer";
import { USER_SIGNUP_MUTATION } from "common/utils/apiQueries";
import { CheckboxField } from "../common/CheckboxField";
import { EmailField } from "../common/EmailField";
import TimezoneSelect from "../common/TimezoneSelect";
import { getClientTimezone } from "common/utils/timezones";
import { WayHeardOfMobilic } from "../common/WayHeardOfMobilic";
import { getPasswordErrors } from "common/utils/passwords";
import { PasswordHelper } from "../common/PasswordHelper";
import { usePageTitle } from "../common/UsePageTitle";
import { PhoneNumber } from "../common/PhoneNumber";
import { Notice } from "../common/Notice";

export function AccountCreation({ employeeInvite, isAdmin }) {
  usePageTitle("Création de compte - Mobilic");
  const api = useApi();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [wayHeardOfMobilic, setWayHeardOfMobilic] = React.useState("");
  const [selectedTimezone, setSelectedTimezone] = React.useState(
    getClientTimezone()
  );
  const [subscribeToNewsletter, setSubscribeToNewsletter] = React.useState(
    true
  );
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
        lastName,
        subscribeToNewsletter,
        selectedTimezone.name,
        wayHeardOfMobilic,
        phoneNumber
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
            lastName,
            subscribeToNewsletter,
            selectedTimezone.name,
            wayHeardOfMobilic,
            phoneNumber
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
    lastName,
    subscribeToNewsletter,
    timezone,
    wayHeardOfMobilic,
    phoneNumber
  ) => {
    setLoading(true);
    await alerts.withApiErrorHandling(
      async () => {
        const signupPayload = {
          email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          subscribeToNewsletter,
          isEmployee: !isAdmin,
          timezoneName: timezone,
          wayHeardOfMobilic: wayHeardOfMobilic,
          ...(isAdmin && phoneNumber ? { phoneNumber } : {}),
          acceptCgu: true
        };
        if (employeeInvite) {
          signupPayload.inviteToken = employeeInvite.inviteToken;
        }
        await api.graphQlMutate(
          USER_SIGNUP_MUTATION,
          signupPayload,
          {
            context: { nonPublicApi: true }
          },
          true
        );
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
          <EmailField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Email"
            value={email}
            setValue={setEmail}
            validate
            error={!!emailError}
            setError={setEmailError}
          />
          <PasswordField
            required
            fullWidth
            className="vertical-form-text-input"
            label="Choisissez un mot de passe"
            variant="standard"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
            }}
            error={password ? !!getPasswordErrors(password) : false}
          />
          <PasswordHelper password={password} />
          <TextField
            required
            fullWidth
            variant="standard"
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
            variant="standard"
            className="vertical-form-text-input"
            label="Nom"
            autoComplete="family-name"
            value={lastName}
            onChange={e => {
              setLastName(e.target.value.trimLeft());
            }}
          />
          <TimezoneSelect
            currentTimezone={selectedTimezone}
            setTimezone={setSelectedTimezone}
          />
          {isAdmin && (
            <>
              <PhoneNumber
                currentPhoneNumber={phoneNumber}
                setCurrentPhoneNumber={setPhoneNumber}
                label="Numéro de téléphone professionel"
              />
              <Notice>
                <Typography textAlign="left" fontSize="0.9rem">
                  Cette information pourra être utilisée par l’équipe Mobilic
                  pour vous contacter à des fins d’aide à la prise en main.
                </Typography>
              </Notice>
            </>
          )}
          {isAdmin && (
            <WayHeardOfMobilic
              setWayHeardOfMobilicValue={setWayHeardOfMobilic}
            />
          )}

          <CheckboxField
            checked={subscribeToNewsletter}
            onChange={() => setSubscribeToNewsletter(!subscribeToNewsletter)}
            label="Je souhaite m'abonner à la lettre d'information de Mobilic pour rester informé par mail des nouveautés du produit"
          />
          <Box my={4}>
            <LoadingButton
              aria-label="Inscription"
              variant="contained"
              color="primary"
              type="submit"
              disabled={
                !!emailError ||
                !email ||
                !!getPasswordErrors(password) ||
                !firstName ||
                !lastName
              }
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
