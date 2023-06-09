import React from "react";
import { useLoadingScreen } from "common/utils/loading";
import { CONTROLLER_SAVE_CONTROL_BULLETIN } from "common/utils/apiQueries";
import { useApi } from "common/utils/api";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TextInput, Button, Title } from "@dataesr/react-dsfr";
import { useSnackbarAlerts } from "../../../common/Snackbar";
import { formatApiError } from "common/utils/errors";

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
      <Title as="h1" look="h4" mt={2} mb={2}>
        Nouveau contrôle “Pas de LIC à bord”
      </Title>
      <Typography variant="h5" mb={2}>
        Veuillez renseigner ces informations afin de créer le contrôle
      </Typography>

      <Stack direction="column" p={2} sx={{ width: "100%" }}>
        <TextInput
          value={userLastName}
          name="userLastName"
          onChange={e => setUserLastName(e.target.value)}
          label="Nom du salarié"
          required
          type="text"
        />
        <TextInput
          value={userFirstName}
          name="userFirstName"
          onChange={e => setUserFirstName(e.target.value)}
          label="Prénom du salarié"
          required
          type="text"
        />
        <TextInput
          value={companyName}
          name="companyName"
          onChange={e => setCompanyName(e.target.value)}
          label="Nom de l'entreprise"
          required
          type="text"
        />
        <TextInput
          value={vehicleRegistrationNumber}
          name="vehicleRegistrationNumber"
          onChange={e => setVehicleRegistrationNumber(e.target.value)}
          label="Immatriculation du véhicule"
          required
          type="text"
        />
        <Stack direction="row" justifyContent="flex-start" p={2} spacing={4}>
          <Button
            title="Enregistrer"
            onClick={() => submitPreliminaryForm()}
            disabled={!canSubmitForm}
          >
            Enregistrer
          </Button>
          <Button title="Annuler" onClick={() => onClose()} secondary>
            Annuler
          </Button>
        </Stack>
      </Stack>
    </>
  );
}
