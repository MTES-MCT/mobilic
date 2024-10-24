import React from "react";
import { useLoadingScreen } from "common/utils/loading";
import { CONTROLLER_SAVE_CONTROL_BULLETIN } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { formatApiError } from "common/utils/errors";
import { MandatoryField } from "../../../common/MandatoryField";
import { Input } from "../../../common/forms/Input";

export function ControllerControlNoLicPreliminaryForm({ onSubmit, onClose }) {
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

  const canSubmitForm = React.useMemo(
    () =>
      !!userFirstName &&
      userLastName &&
      companyName &&
      vehicleRegistrationNumber,
    [userFirstName, userLastName, companyName, vehicleRegistrationNumber]
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
    <>
      <Typography variant="h4" component="h1" sx={{ marginY: 2 }}>
        Nouveau contrôle “Pas de LIC à bord”
      </Typography>
      <Typography variant="h5" mb={2}>
        Veuillez renseigner ces informations afin de créer le contrôle
      </Typography>

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
    </>
  );
}
