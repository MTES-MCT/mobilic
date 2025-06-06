import React from "react";

import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
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
import {
  checkRequiredFieldStep1,
  checkRequiredFieldStep2
} from "../../utils/controlBulletin";
import { ButtonsGroup } from "@codegouvfr/react-dsfr/ButtonsGroup";
import { useInfractions } from "../../utils/contextInfractions";
import { useControl } from "../../utils/contextControl";
import { scrollToId } from "../../../common/hooks/useScroll";

const STEPS = {
  1: {
    title: "Données relatives au salarié",
    checkRequiredField: checkRequiredFieldStep1,
    successMessage: "Les informations ont été enregistrées"
  },
  2: {
    title: "Données relatives à l'entreprise et au véhicule",
    checkRequiredField: checkRequiredFieldStep2,
    successMessage: "Les informations ont été enregistrées"
  },
  3: {
    title: "Relevé des infractions",
    successMessage: "Le bulletin de contrôle a été enregistré"
  }
};

export function ControllerControlBulletin({
  onClose,
  setMustConfirmBeforeClosing,
  onSaveControlBulletin,
  saveInfractions
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
  const [showErrors, setShowErrors] = React.useState(false);
  const { setIsReportingInfractions } = useInfractions();
  const { controlData } = useControl();

  const onUpdateGrecoId = newGrecoId => {
    setGrecoId(newGrecoId);
    setFieldUpdated(true);
  };

  React.useEffect(() => scrollToId("control-bulletin-header"), [step]);

  React.useEffect(() => {
    setControlBulletin(initControlBulletinFromControlData());
  }, []);

  React.useEffect(() => {
    setMustConfirmBeforeClosing(fieldUpdated);
  }, [fieldUpdated]);

  const initControlBulletinFromControlData = () => {
    if (!controlData) {
      return { userNationality: "FRA", vehicleRegistrationCountry: "FRA" };
    } else {
      return {
        userFirstName: controlData.userFirstName,
        userLastName: controlData.userLastName,
        userBirthDate: controlData.user?.birthDate,
        companyName: controlData.companyName,
        vehicleRegistrationNumber: controlData.vehicleRegistrationNumber,
        vehicleRegistrationCountry:
          controlData.controlBulletin?.vehicleRegistrationCountry,
        ...controlData.controlBulletin
      };
    }
  };

  const handleEditControlBulletin = e => {
    const { name, value } = e.target;
    setControlBulletin(prevState => ({
      ...prevState,
      [name]: value
    }));
    setFieldUpdated(true);
  };

  const onModifyInfractions = () => {
    setFieldUpdated(true);
  };

  const onSaveButton = async newControlBulletin => {
    if (
      STEPS[step].checkRequiredField &&
      !STEPS[step].checkRequiredField(newControlBulletin)
    ) {
      setShowErrors(true);
    } else {
      setShowErrors(false);
      if (fieldUpdated) {
        if (!STEPS[step + 1]) {
          await saveInfractions();
        }
        await saveControlBulletin(
          newControlBulletin,
          STEPS[step].successMessage
        );
      } else if (!STEPS[step + 1]) {
        alerts.success(STEPS[step].successMessage, "", 3000);
      }
      if (!STEPS[step + 1]) {
        setIsReportingInfractions(false);
        onClose(true);
      } else {
        setStep(step + 1);
      }
    }
  };

  const onBackOrCloseButton = () => {
    if (!STEPS[step - 1]) {
      onClose();
    } else {
      setStep(step - 1);
    }
  };

  const saveControlBulletin = async (newControlBulletin, successMessage) =>
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
            locationDepartment: newControlBulletin.locationDepartment,
            locationCommune: newControlBulletin.locationCommune,
            locationLieu: newControlBulletin.locationLieu,
            locationId: newControlBulletin.locationId,
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
            observation: newControlBulletin.observation,
            isVehicleImmobilized: newControlBulletin.isVehicleImmobilized
          },
          { context: { nonPublicApi: true } }
        );
        onSaveControlBulletin(apiResponse.data.controllerSaveControlBulletin);
        alerts.success(successMessage, "", 3000);
        setFieldUpdated(false);
        setMustConfirmBeforeClosing(false);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });

  return (
    <>
      <ControlBulletinHeader
        onCloseDrawer={onBackOrCloseButton}
        backLinkLabel={
          !STEPS[step - 1]
            ? `Retour au contrôle ${controlData.id}`
            : `Revenir à l'étape ${step - 1}/${Object.keys(STEPS).length}`
        }
      />
      <Typography variant="h1" mb={2}>
        Éditer un bulletin de contrôle
      </Typography>
      <Typography>
        Pour éditer un bulletin de contrôle au format PDF, veuillez renseigner
        les champs ci-dessous.
      </Typography>
      <Stepper
        currentStep={step}
        nextTitle={STEPS[step + 1]?.title || null}
        stepCount={3}
        title={STEPS[step].title}
      />
      {step === 1 && (
        <ControlBulletinFormStep1
          handleEditControlBulletin={handleEditControlBulletin}
          controlBulletin={controlBulletin}
          showErrors={showErrors}
        />
      )}
      {step === 2 && (
        <ControlBulletinFormStep2
          handleEditControlBulletin={handleEditControlBulletin}
          controlBulletin={controlBulletin}
          showErrors={showErrors}
        />
      )}
      {step === 3 && (
        <ControlBulletinFormStep3
          handleEditControlBulletin={handleEditControlBulletin}
          controlBulletin={controlBulletin}
          grecoId={grecoId}
          onUpdateGrecoId={onUpdateGrecoId}
          onModifyInfractions={onModifyInfractions}
        />
      )}
      <ButtonsGroup
        buttons={[
          {
            onClick: () => onSaveButton(controlBulletin),
            children: !STEPS[step + 1] ? "Enregistrer" : "Suivant"
          },
          {
            children: "Annuler",
            onClick: () => onClose(),
            priority: "secondary"
          }
        ]}
        inlineLayoutWhen="sm and up"
        alignment="right"
      />
    </>
  );
}
