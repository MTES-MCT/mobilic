import React from "react";
import { useLoadingScreen } from "common/utils/loading";
import { CONTROLLER_SAVE_CONTROL_BULLETIN } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import Stack from "@mui/material/Stack";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { MandatoryField } from "../../../common/MandatoryField";
import { Input } from "../../../common/forms/Input";
import { RadioButtons } from "../../../common/forms/RadioButtons";
import { CONTROL_TYPES } from "../../utils/useReadControlData";

export function ControllerControlPreliminaryForm({ type, onSubmit, onClose }) {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  const [userFirstName, setUserFirstName] = React.useState("");
  const [userLastName, setUserLastName] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [
    vehicleRegistrationNumber,
    setVehicleRegistrationNumber
  ] = React.useState("");
  const [dayPageFilled, setDayPageFilled] = React.useState();

  const canSubmitForm = React.useMemo(
    () =>
      !!userFirstName &&
      !!userLastName &&
      !!companyName &&
      !!vehicleRegistrationNumber &&
      (type === CONTROL_TYPES.NO_LIC || dayPageFilled !== undefined),
    [
      userFirstName,
      userLastName,
      companyName,
      vehicleRegistrationNumber,
      dayPageFilled
    ]
  );

  const submitPreliminaryForm = async () =>
    withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_CONTROL_BULLETIN,
          {
            userFirstName,
            userLastName,
            companyName,
            vehicleRegistrationNumber
          },
          { context: { nonPublicApi: true } }
        );
        onSubmit(apiResponse.data.controllerSaveControlBulletin.id);
        alerts.success("Le contrôle a été créé.", "", 3000);
      } catch (err) {
        alerts.error(formatApiError(err), "", 6000);
      }
    });

  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <MandatoryField />
      <Input
        nativeInputProps={{
          value: userLastName,
          onChange: e => setUserLastName(e.target.value),
          name: "userLastName"
        }}
        label="Nom du salarié"
        required
      />

      <Input
        nativeInputProps={{
          value: userFirstName,
          onChange: e => setUserFirstName(e.target.value),
          name: "userFirstName"
        }}
        label="Prénom du salarié"
        required
      />
      <Input
        nativeInputProps={{
          value: companyName,
          onChange: e => setCompanyName(e.target.value),
          name: "companyName"
        }}
        label="Nom de l'entreprise"
        required
      />
      <Input
        nativeInputProps={{
          value: vehicleRegistrationNumber,
          onChange: e => setVehicleRegistrationNumber(e.target.value),
          name: "vehicleRegistrationNumber"
        }}
        label="Immatriculation du véhicule"
        required
      />
      {type === CONTROL_TYPES.LIC_PAPIER && (
        <RadioButtons
          legend="Page du jour remplie"
          name="dayPageFilled"
          options={[
            {
              label: "Oui",
              nativeInputProps: {
                checked: dayPageFilled === true,
                onChange: () => setDayPageFilled(true)
              }
            },
            {
              label: "Non",
              nativeInputProps: {
                checked: dayPageFilled === false,
                onChange: () => setDayPageFilled(false)
              }
            }
          ]}
          required
        />
      )}
      <Stack direction="row" justifyContent="flex-start" p={2} spacing={4}>
        <Button
          onClick={() => submitPreliminaryForm()}
          disabled={!canSubmitForm}
        >
          Enregistrer
        </Button>
        <Button onClick={() => onClose()} priority="secondary">
          Annuler
        </Button>
      </Stack>
    </Stack>
  );
}
