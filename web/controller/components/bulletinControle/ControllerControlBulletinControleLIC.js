import React from "react";

import Stack from "@mui/material/Stack";
import {
  Button,
  TextInput,
  Select,
  Radio,
  RadioGroup
} from "@dataesr/react-dsfr";

import { NATIONALITIES } from "../../utils/bulletinControle";
import Typography from "@mui/material/Typography";
import { BulletinControleHeader } from "./BulletinControleHeader";
import { CONTROLLER_SAVE_CONTROL_BULLETIN } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import { useLoadingScreen } from "common/utils/loading";
import { formatApiError } from "common/utils/errors";
import { useSnackbarAlerts } from "../../../common/Snackbar";

export function ControllerControlBulletinControleLIC({
  controlData,
  onClose,
  setMustConfirmBeforeClosing
}) {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();
  const [controlBulletin, setControlBulletin] = React.useState({});
  React.useEffect(() => {
    setControlBulletin(controlBulletin);
  }, [controlBulletin]);

  React.useEffect(() => {
    setControlBulletin(initControlBulletinFromControlData());
  }, []);

  const initControlBulletinFromControlData = () => {
    if (!controlData) {
      return {};
    } else if (controlData?.controlBulletin) {
      return { ...controlData.controlBulletin };
    } else {
      return {
        userFirstName: controlData.user.firstName,
        userLastName: controlData.user.lastName,
        userBirthDate: controlData.user.birthDate
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
    setMustConfirmBeforeClosing(true);
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
            licPaperPresented: newBulletinControle.licPaperPresented
          },
          { context: { nonPublicApi: true } }
        );
        controlData.controlBulletin =
          apiResponse.data.controllerSaveControlBulletin.controlBulletin;
        alerts.success("Le bordereau de contrôle a été enregistré.", "", 6000);
        setMustConfirmBeforeClosing(false);
        onClose(true);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });

  return [
    <BulletinControleHeader
      key={0}
      onCloseDrawer={() => onClose()}
      controlData={controlData}
    />,
    <Typography key={5} variant="h1" mb={2}>
      Éditer un bulletin de contrôle
    </Typography>,
    <Typography key={10}>
      Enregistrez les informations de contrôle d'un LIC papier afin de le
      retrouver dans votre historique de contrôles et de générer un BDC au
      format PDF.
    </Typography>,
    <div key={15} className="fr-stepper">
      <h2 className="fr-stepper__title">
        <span className="fr-stepper__state">Étape 1 sur 3</span>
        Données relatives au salarié
      </h2>
      <div
        className="fr-stepper__steps"
        data-fr-current-step="1"
        data-fr-steps="3"
      ></div>
      <p className="fr-stepper__details">
        <span className="fr-text--bold">Étape suivante :</span> Relevez les
        infractions
      </p>
    </div>,
    <Stack key={20} direction="column" p={2} sx={{ width: "100%" }}>
      <RadioGroup
        legend="LIC papier présenté ?"
        isInline
        required
        onChange={e =>
          handleEditControlBulletin({
            target: { name: "licPaperPresented", value: e }
          })
        }
      >
        <Radio
          label="Oui"
          value={true}
          defaultChecked={controlBulletin?.licPaperPresented}
        />
        <Radio
          label="Non"
          value={false}
          defaultChecked={controlBulletin?.licPaperPresented === false}
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
        options={NATIONALITIES}
      />
      <Stack direction="row" justifyContent="flex-start" spacing={4}>
        <Button
          title="Enregistrer"
          onClick={() => saveControlBulletin(controlBulletin)}
        >
          Enregistrer
        </Button>
        <Button title="Annuler" onClick={onClose} secondary>
          Annuler
        </Button>
      </Stack>
    </Stack>
  ];
}
