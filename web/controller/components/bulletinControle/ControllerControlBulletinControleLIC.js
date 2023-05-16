import React from "react";

import Stack from "@mui/material/Stack";
import {
  Button,
  TextInput,
  Select,
  Radio,
  RadioGroup,
  Stepper
} from "@dataesr/react-dsfr";

import { CONTROL_BULLETIN_TRANSPORT_TYPE } from "../../utils/bulletinControle";
import Typography from "@mui/material/Typography";
import { BulletinControleHeader } from "./BulletinControleHeader";
import { CONTROLLER_SAVE_CONTROL_BULLETIN } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { COUNTRIES } from "../../utils/country";

const STEPS = {
  1: { title: "Données relatives au salarié" },
  2: { title: "Données relatives à l'entreprise et au véhicule" },
  3: { title: "Relevez des infractions" }
};

export function ControllerControlBulletinControleLIC({
  controlData,
  onClose,
  setMustConfirmBeforeClosing
}) {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const [controlBulletin, setControlBulletin] = React.useState({});
  const [fieldUpdated, setFieldUpdated] = React.useState(false);
  const [step, setStep] = React.useState(1);

  React.useEffect(() => {
    setControlBulletin(initControlBulletinFromControlData());
  }, []);

  React.useEffect(() => {
    setMustConfirmBeforeClosing(fieldUpdated);
  }, [fieldUpdated]);

  const initControlBulletinFromControlData = () => {
    if (!controlData) {
      return {};
    } else if (controlData?.controlBulletin) {
      return { ...controlData.controlBulletin };
    } else {
      return {
        userFirstName: controlData.user.firstName,
        userLastName: controlData.user.lastName,
        userBirthDate: controlData.user.birthDate,
        companyName: controlData.companyName,
        siren: controlData.siren,
        companyAddress: controlData.companyAddress,
        missionAddressBegin: controlData.missionAddressBegin,
        vehicleRegistrationNumber: controlData.vehicleRegistrationNumber
      };
    }
  };

  const handleEditControlBulletin = e => {
    const { name, value } = e.target;
    setControlBulletin(prevState => ({
      ...prevState,
      [name]: value,
      touched: true
    }));
    setFieldUpdated(true);
  };

  const onSaveButton = async newBulletinControle => {
    if (fieldUpdated) {
      await saveControlBulletin(newBulletinControle);
    } else if (!STEPS[step + 1]) {
      alerts.success("Le bulletin de contrôle a été enregistré.", "", 3000);
    }
    if (!STEPS[step + 1]) {
      onClose(true);
    } else {
      setStep(step + 1);
    }
  };

  const onBackOrCloseButton = () => {
    if (!STEPS[step - 1]) {
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  const saveControlBulletin = async newBulletinControle =>
    withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_CONTROL_BULLETIN,
          {
            controlId: controlData?.id,
            userFirstName: newBulletinControle.userFirstName,
            userLastName: newBulletinControle.userLastName,
            userBirthDate: newBulletinControle.userBirthDate,
            userNationality: newBulletinControle.userNationality,
            licPaperPresented: newBulletinControle.licPaperPresented,
            siren: newBulletinControle.siren,
            companyName: newBulletinControle.companyName,
            companyAddress: newBulletinControle.companyAddress,
            vehicleRegistrationNumber:
              newBulletinControle.vehicleRegistrationNumber,
            vehicleRegistrationCountry:
              newBulletinControle.vehicleRegistrationCountry,
            missionAddressBegin: newBulletinControle.missionAddressBegin,
            missionAddressEnd: newBulletinControle.missionAddressEnd,
            transportType: newBulletinControle.transportType,
            articlesNature: newBulletinControle.articlesNature,
            licenseNumber: newBulletinControle.licenseNumber,
            licenseCopyNumber: newBulletinControle.licenseCopyNumber,
            observation: newBulletinControle.observation
          },
          { context: { nonPublicApi: true } }
        );
        controlData.controlBulletin =
          apiResponse.data.controllerSaveControlBulletin.controlBulletin;
        alerts.success("Le bulletin de contrôle a été enregistré.", "", 3000);
        setFieldUpdated(false);
        setMustConfirmBeforeClosing(false);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });

  return [
    <BulletinControleHeader
      key={0}
      onCloseDrawer={onBackOrCloseButton}
      backLinkLabel={
        !STEPS[step - 1]
          ? `Retour au contrôle ${controlData.id}`
          : `Revenir à l'étape ${step - 1}/${Object.keys(STEPS).length}`
      }
    />,
    <Typography key={5} variant="h1" mb={2}>
      Éditer un bulletin de contrôle
    </Typography>,
    <Typography key={10}>
      Enregistrez les informations de contrôle d'un LIC papier afin de le
      retrouver dans votre historique de contrôles et de générer un BDC au
      format PDF.
    </Typography>,
    <Stepper
      key={15}
      currentStep={step}
      steps={3}
      currentTitle={STEPS[step].title}
      nextStepTitle={STEPS[step + 1]?.title || null}
    />,
    step === 1 && (
      <Stack key={20} direction="column" p={2} sx={{ width: "100%" }}>
        <RadioGroup
          legend="LIC papier présenté ?"
          isInline
          required
          onChange={e =>
            handleEditControlBulletin({
              target: { name: "licPaperPresented", value: e === "true" }
            })
          }
        >
          <Radio
            label="Oui"
            value={"true"}
            defaultChecked={controlBulletin.licPaperPresented}
          />
          <Radio
            label="Non"
            value={"false"}
            defaultChecked={controlBulletin.licPaperPresented === false}
          />
        </RadioGroup>
        <TextInput
          value={controlBulletin.userLastName}
          name="userLastName"
          onChange={e => handleEditControlBulletin(e)}
          label="Nom du salarié"
          required
        />
        <TextInput
          value={controlBulletin.userFirstName}
          name="userFirstName"
          onChange={e => handleEditControlBulletin(e)}
          label="Prénom du salarié"
          required
        />
        <TextInput
          value={controlBulletin.userBirthDate}
          name="userBirthDate"
          onChange={e => handleEditControlBulletin(e)}
          label="Date de naissance"
          required
          type="date"
        />
        <Select
          label="Nationalité"
          selected={controlBulletin.userNationality}
          name="userNationality"
          required
          onChange={e => {
            handleEditControlBulletin(e);
          }}
          options={COUNTRIES}
        />
      </Stack>
    ),
    step === 2 && (
      <Stack key={30} direction="column" p={2} sx={{ width: "100%" }}>
        <TextInput
          value={controlBulletin.siren}
          name="siren"
          onChange={e => handleEditControlBulletin(e)}
          label="Entreprise responsable (de rattachement)"
          hint="N° SIREN"
          required
        />
        <TextInput
          value={controlBulletin.companyName}
          name="companyName"
          onChange={e => handleEditControlBulletin(e)}
          label="Nom de l'entreprise"
          required
        />
        <TextInput
          value={controlBulletin.companyAddress}
          name="companyAddress"
          onChange={e => handleEditControlBulletin(e)}
          label="Adresse de l'entreprise"
          required
        />
        <TextInput
          value={controlBulletin.vehicleRegistrationNumber}
          name="vehicleRegistrationNumber"
          onChange={e => handleEditControlBulletin(e)}
          label="Immatriculation du véhicule"
          required
        />
        <Select
          label="Pays d'immatriculation"
          selected={controlBulletin.vehicleRegistrationCountry}
          name="vehicleRegistrationCountry"
          required
          onChange={e => {
            handleEditControlBulletin(e);
          }}
          options={COUNTRIES}
        />
        <TextInput
          value={controlBulletin.missionAddressBegin}
          name="missionAddressBegin"
          onChange={e => handleEditControlBulletin(e)}
          label="Provenance"
          required
        />
        <TextInput
          value={controlBulletin.missionAddressEnd}
          name="missionAddressEnd"
          onChange={e => handleEditControlBulletin(e)}
          label="Destination"
          required
        />
        <RadioGroup
          legend="Type de transport"
          required
          onChange={e =>
            handleEditControlBulletin({
              target: { name: "transportType", value: e }
            })
          }
        >
          <Radio
            label={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERIEUR.label}
            value={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERIEUR.apiValue}
            defaultChecked={
              controlBulletin.transportType ===
              CONTROL_BULLETIN_TRANSPORT_TYPE.INTERIEUR.apiValue
            }
          />
          <Radio
            label={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERNATIONAL.label}
            value={CONTROL_BULLETIN_TRANSPORT_TYPE.INTERNATIONAL.apiValue}
            defaultChecked={
              controlBulletin.transportType ===
              CONTROL_BULLETIN_TRANSPORT_TYPE.INTERNATIONAL.apiValue
            }
          />
          <Radio
            label={CONTROL_BULLETIN_TRANSPORT_TYPE.CABOTAGE.label}
            value={CONTROL_BULLETIN_TRANSPORT_TYPE.CABOTAGE.apiValue}
            defaultChecked={
              controlBulletin.transportType ===
              CONTROL_BULLETIN_TRANSPORT_TYPE.CABOTAGE.apiValue
            }
          />
        </RadioGroup>
        <TextInput
          value={controlBulletin.articlesNature}
          name="articlesNature"
          onChange={e => handleEditControlBulletin(e)}
          label="Nature de la marchandise"
        />
        <TextInput
          value={controlBulletin.licenseNumber}
          name="licenseNumber"
          onChange={e => handleEditControlBulletin(e)}
          label="N° de la licence"
        />
        <TextInput
          value={controlBulletin.licenseCopyNumber}
          name="licenseCopyNumber"
          onChange={e => handleEditControlBulletin(e)}
          label="N° de copie conforme de la licence"
        />
      </Stack>
    ),
    step === 3 && (
      <Stack key={40} direction="column" p={2} sx={{ width: "100%" }}>
        <TextInput
          value={controlBulletin.observation}
          name="observation"
          label="Observations"
          rows="3"
          onChange={e => handleEditControlBulletin(e)}
          textarea
        />
      </Stack>
    ),
    <Stack
      key={50}
      direction="row"
      justifyContent="flex-start"
      p={2}
      spacing={4}
    >
      <Button title="Enregistrer" onClick={() => onSaveButton(controlBulletin)}>
        {!STEPS[step + 1] ? "Enregistrer" : "Suivant"}
      </Button>
      <Button title="Annuler" onClick={() => onClose()} secondary>
        Annuler
      </Button>
    </Stack>
  ];
}
