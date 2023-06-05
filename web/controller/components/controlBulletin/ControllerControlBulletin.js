import React from "react";

import Stack from "@mui/material/Stack";
import { Button, Stepper } from "@dataesr/react-dsfr";
import Typography from "@mui/material/Typography";
import { ControlBulletinHeader } from "./ControlBulletinHeader";
import {
  CONTROLLER_CHANGE_GRECO_ID,
  CONTROLLER_SAVE_CONTROL_BULLETIN
} from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { ControlBulletinFormStep3 } from "./ControlBulletinFormStep3";
import { ControlBulletinFormStep2 } from "./ControlBulletinFormStep2";
import { ControlBulletinFormStep1 } from "./ControlBulletinFormStep1";
import {
  broadCastChannel,
  useStoreSyncedWithLocalStorage
} from "common/store/store";
import { syncControllerUser } from "../../utils/loadControllerUserData";

const STEPS = {
  1: { title: "Données relatives au salarié" },
  2: { title: "Données relatives à l'entreprise et au véhicule" },
  3: { title: "Relevez des infractions" }
};

export function ControllerControlBulletin({
  controlData,
  onClose,
  setMustConfirmBeforeClosing,
  onSaveControlBulletin
}) {
  const store = useStoreSyncedWithLocalStorage();
  const controllerUserInfo = store.controllerInfo();
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const [controlBulletin, setControlBulletin] = React.useState({});
  const [fieldUpdated, setFieldUpdated] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [grecoId, setGrecoId] = React.useState(
    controllerUserInfo.grecoId || ""
  );

  const onUpdateGrecoId = newGrecoId => {
    setGrecoId(newGrecoId);
    setFieldUpdated(true);
  };

  React.useEffect(() => {
    setControlBulletin(initControlBulletinFromControlData());
  }, []);

  React.useEffect(() => {
    setMustConfirmBeforeClosing(fieldUpdated);
  }, [fieldUpdated]);

  const initControlBulletinFromControlData = () => {
    if (!controlData) {
      return {};
    } else if (controlData.controlBulletinCreationTime) {
      return {
        userFirstName: controlData.userFirstName,
        userLastName: controlData.userLastName,
        userBirthDate: controlData.user?.birthDate,
        companyName: controlData.companyName,
        vehicleRegistrationNumber: controlData.vehicleRegistrationNumber,
        ...controlData.controlBulletin
      };
    } else {
      return {
        userFirstName: controlData.userFirstName,
        userLastName: controlData.userLastName,
        userBirthDate: controlData.user?.birthDate,
        companyName: controlData.companyName,
        vehicleRegistrationNumber: controlData.vehicleRegistrationNumber,
        siren: controlData.controlBulletin?.siren,
        companyAddress: controlData.controlBulletin?.companyAddress,
        missionAddressBegin: controlData.controlBulletin?.missionAddressBegin
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

  const onSaveButton = async newControlBulletin => {
    if (fieldUpdated) {
      await saveControlBulletin(newControlBulletin);
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

  const saveControlBulletin = async newControlBulletin =>
    withLoadingScreen(async () => {
      try {
        if (grecoId !== controllerUserInfo.grecoId) {
          const updateControllerUserResponse = await api.graphQlMutate(
            CONTROLLER_CHANGE_GRECO_ID,
            {
              grecoId
            },
            { context: { nonPublicApi: true } }
          );
          await syncControllerUser(
            updateControllerUserResponse.data.controllerChangeGrecoId,
            api,
            store
          );
          await broadCastChannel.postMessage("update");
        }
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_CONTROL_BULLETIN,
          {
            controlId: controlData?.id,
            userFirstName: newControlBulletin.userFirstName,
            userLastName: newControlBulletin.userLastName,
            userBirthDate: newControlBulletin.userBirthDate,
            userNationality: newControlBulletin.userNationality,
            siren: newControlBulletin.siren,
            companyName: newControlBulletin.companyName,
            companyAddress: newControlBulletin.companyAddress,
            vehicleRegistrationNumber:
              newControlBulletin.vehicleRegistrationNumber,
            vehicleRegistrationCountry:
              newControlBulletin.vehicleRegistrationCountry,
            missionAddressBegin: newControlBulletin.missionAddressBegin,
            missionAddressEnd: newControlBulletin.missionAddressEnd,
            transportType: newControlBulletin.transportType,
            articlesNature: newControlBulletin.articlesNature,
            licenseNumber: newControlBulletin.licenseNumber,
            licenseCopyNumber: newControlBulletin.licenseCopyNumber,
            observation: newControlBulletin.observation
          },
          { context: { nonPublicApi: true } }
        );
        onSaveControlBulletin(
          apiResponse.data.controllerSaveControlBulletin.controlBulletin
        );
        alerts.success("Le bulletin de contrôle a été enregistré.", "", 3000);
        setFieldUpdated(false);
        setMustConfirmBeforeClosing(false);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });

  return [
    <ControlBulletinHeader
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
      nextStepTitle={STEPS[step + 1]?.title || ""}
    />,
    step === 1 && (
      <ControlBulletinFormStep1
        key={20}
        handleEditControlBulletin={handleEditControlBulletin}
        controlBulletin={controlBulletin}
      />
    ),
    step === 2 && (
      <ControlBulletinFormStep2
        key={30}
        handleEditControlBulletin={handleEditControlBulletin}
        controlBulletin={controlBulletin}
      />
    ),
    step === 3 && (
      <ControlBulletinFormStep3
        key={40}
        handleEditControlBulletin={handleEditControlBulletin}
        controlBulletin={controlBulletin}
        grecoId={grecoId}
        onUpdateGrecoId={onUpdateGrecoId}
      />
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
