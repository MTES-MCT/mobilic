import React from "react";
import Box from "@mui/material/Box";
import { useApi } from "common/utils/api";
import { useHistory } from "react-router-dom";
import { useStoreSyncedWithLocalStorage } from "common/store/store";
import SignupStepper from "./SignupStepper";
import { LoadingButton } from "common/components/LoadingButton";
import {
  buildCallbackUrl,
  buildFranceConnectUrl
} from "common/utils/franceConnect";
import { FranceConnectContainer } from "../common/FranceConnect";
import { useModals } from "common/utils/modals";
import { useSnackbarAlerts } from "../common/Snackbar";
import { USER_SIGNUP_MUTATION } from "common/utils/apiQueries";
import { EmailField } from "../common/EmailField";
import TimezoneSelect from "../common/TimezoneSelect";
import { getClientTimezone } from "common/utils/timezones";
import { WayHeardOfMobilic } from "../common/WayHeardOfMobilic";
import { getPasswordErrors } from "common/utils/passwords";
import { usePageTitle } from "../common/UsePageTitle";
import { MandatoryField } from "../common/MandatoryField";
import { PhoneNumber } from "../common/PhoneNumber";
import Notice from "../common/Notice";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "../common/forms/Input";
import { PasswordInput } from "../common/forms/PasswordInput";

export function AccountCreation({ employeeInvite, isAdmin }) {
  usePageTitle("Création de compte - Mobilic");
  const api = useApi();
  const history = useHistory();
  const store = useStoreSyncedWithLocalStorage();
  const modals = useModals();
  const alerts = useSnackbarAlerts();

  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [firstNameError, setFirstNameError] = React.useState(false);
  const [lastNameError, setLastNameError] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [forcePasswordValidation, setForcePasswordValidation] = React.useState(
    false
  );
  const [wayHeardOfMobilic, setWayHeardOfMobilic] = React.useState("");
  const [selectedTimezone, setSelectedTimezone] = React.useState(
    getClientTimezone()
  );
  const [subscribeToNewsletter, setSubscribeToNewsletter] = React.useState(
    isAdmin ? true : false
  );
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (
      !email ||
      !!emailError ||
      !!getPasswordErrors(password) ||
      !firstName ||
      !lastName ||
      !email
    ) {
      if (!email) {
        setEmailError("Veuillez compléter ce champ");
      }
      setFirstNameError(!firstName);
      setLastNameError(!lastName);
      setForcePasswordValidation(true);
      return;
    }

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
        setForcePasswordValidation(false);
      }
    );
    setLoading(false);
  };

  return (
    <>
      <div className="fr-container fr-mt-8v fr-mt-md-14v fr-mb-2v fr-mb-md-8v">
        <div className="fr-grid-row fr-grid-row--gutters fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
            <h1 className="fr-h2" style={{ textAlign: "center" }}>
              {isAdmin ? "S'inscrire comme gestionnaire" : "Créer mon compte"}
            </h1>
            {employeeInvite && employeeInvite.company && (
              <p className="fr-text--lead">
                Vous avez été invité(e) par{" "}
                <span style={{ fontWeight: "bold" }}>
                  {employeeInvite.company.name}
                </span>{" "}
                à créer un compte
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="fr-container fr-container--fluid fr-mb-md-14v">
        <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
          <div className="fr-col-12 fr-col-md-10 fr-col-lg-8">
            <div
              style={{ backgroundColor: "var(--background-alt-grey)" }}
              className="fr-container fr-background-alt--grey fr-px-md-0 fr-py-10v fr-py-md-14v"
            >
              <div className="fr-grid-row fr-grid-row-gutters fr-grid-row--center">
                <div className="fr-col-12 fr-col-md-10 fr-col-lg-9">
                  {isAdmin && (
                    <div className="fr-mb-6v">
                      <SignupStepper activeStep={0} />
                      <p className="fr-hr" />
                    </div>
                  )}
                  <div className="fr-mb-6v">
                    <h6>Via FranceConnect</h6>
                    <FranceConnectContainer
                      onButtonClick={() => {
                        const callbackUrl = buildCallbackUrl(
                          employeeInvite,
                          true,
                          isAdmin
                        );
                        window.location.href = buildFranceConnectUrl(
                          callbackUrl
                        );
                      }}
                    />
                  </div>
                  <p className="fr-hr-or">ou</p>
                  <div>
                    <h6>Via le formulaire d'inscription</h6>
                    <MandatoryField />
                    <form
                      className="vertical-form centered"
                      noValidate
                      onSubmit={handleSubmit}
                    >
                      <EmailField
                        required
                        value={email}
                        setValue={setEmail}
                        validate
                        error={emailError}
                        setError={setEmailError}
                        showHint
                        autoComplete="email"
                      />
                      <PasswordInput
                        label="Mot de passe"
                        nativeInputProps={{
                          autoComplete: "new-password",
                          value: password,
                          onChange: e => setPassword(e.target.value)
                        }}
                        displayMessages
                        forceValidation={forcePasswordValidation}
                        required
                      />
                      <Input
                        nativeInputProps={{
                          value: firstName,
                          onChange: e =>
                            setFirstName(e.target.value.trimStart()),
                          onBlur: e =>
                            setFirstNameError(!e.target.value.trim()),
                          autoComplete: "given-name"
                        }}
                        label="Prénom"
                        state={firstNameError ? "error" : "default"}
                        stateRelatedMessage="Veuillez compléter ce champ"
                        required
                      />
                      <Input
                        nativeInputProps={{
                          value: lastName,
                          onChange: e =>
                            setLastName(e.target.value.trimStart()),
                          onBlur: e => setLastNameError(!e.target.value.trim()),
                          autoComplete: "family-name"
                        }}
                        label="Nom"
                        state={lastNameError ? "error" : "default"}
                        stateRelatedMessage="Veuillez compléter ce champ"
                        required
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
                          <Notice
                            description="Cette information pourra être utilisée par l’équipe Mobilic
                  pour vous contacter à des fins d’aide à la prise en main."
                          />
                        </>
                      )}
                      {isAdmin && (
                        <WayHeardOfMobilic
                          setWayHeardOfMobilicValue={setWayHeardOfMobilic}
                        />
                      )}
                      {!isAdmin && (
                        <Checkbox
                          legend=""
                          options={[
                            {
                              label:
                                "En cochant cette case, j'accepte que mon adresse e-mail soit utilisée pour m'envoyer la lettre d'information Mobilic et pour me contacter en cas de besoin d'assistance technique.",
                              nativeInputProps: {
                                value: subscribeToNewsletter,
                                onChange: () =>
                                  setSubscribeToNewsletter(
                                    !subscribeToNewsletter
                                  )
                              }
                            }
                          ]}
                        />
                      )}
                      {isAdmin && (
                        <Checkbox
                          legend=""
                          options={[
                            {
                              label:
                                "Je m’oppose à ce que mon adresse e-mail soit utilisée pour recevoir la lettre d'information, les informations sur les nouvelles fonctionnalités et les dates de formation gestionnaire.",
                              nativeInputProps: {
                                value: !subscribeToNewsletter,
                                onChange: () =>
                                  setSubscribeToNewsletter(
                                    !subscribeToNewsletter
                                  )
                              }
                            }
                          ]}
                        />
                      )}
                      <Box my={4}>
                        <LoadingButton
                          aria-label="Inscription"
                          type="submit"
                          loading={loading}
                        >
                          M'inscrire
                        </LoadingButton>
                      </Box>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
