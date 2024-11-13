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
import { Select } from "../../../common/forms/Select";
import { RadioButtons } from "../../../common/forms/RadioButtons";
import { BirthDate } from "../../../common/forms/BirthDate";
import { CONTROL_TYPES } from "../../utils/useReadControlData";
import { COUNTRIES } from "../../utils/country";
import { BUSINESS_TYPES } from "common/utils/businessTypes";
import { CompanyControlData } from "../forms/CompanyControlData";

export function ControllerControlPreliminaryForm({ type, onSubmit, onClose }) {
  const api = useApi();
  const withLoadingScreen = useLoadingScreen();
  const alerts = useSnackbarAlerts();

  const [userFirstName, setUserFirstName] = React.useState("");
  const [userLastName, setUserLastName] = React.useState("");
  const [userBirthDate, setUserBirthDate] = React.useState("");
  const [userNationality, setUserNationality] = React.useState("");
  const [siren, setSiren] = React.useState("");
  const [companyName, setCompanyName] = React.useState("");
  const [companyAddress, setCompanyAddress] = React.useState("");
  const [businessType, setBusinessType] = React.useState("");
  const [
    vehicleRegistrationNumber,
    setVehicleRegistrationNumber
  ] = React.useState("");
  const [isDayPageFilled, setIsDayPageFilled] = React.useState();

  const canSubmitForm = React.useMemo(
    () =>
      !!userFirstName &&
      !!userLastName &&
      !!userBirthDate &&
      !!userNationality &&
      !!siren &&
      !!companyName &&
      !!companyAddress &&
      !!businessType &&
      !!vehicleRegistrationNumber &&
      (type === CONTROL_TYPES.NO_LIC || isDayPageFilled !== undefined),
    [
      userFirstName,
      userLastName,
      userBirthDate,
      userNationality,
      siren,
      companyName,
      companyAddress,
      businessType,
      vehicleRegistrationNumber,
      isDayPageFilled
    ]
  );

  const submitPreliminaryForm = async () =>
    withLoadingScreen(async () => {
      try {
        const apiResponse = await api.graphQlMutate(
          CONTROLLER_SAVE_CONTROL_BULLETIN,
          {
            type,
            userFirstName,
            userLastName,
            userBirthDate,
            userNationality,
            siren,
            companyName,
            companyAddress,
            businessType,
            vehicleRegistrationNumber,
            isDayPageFilled
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

      <BirthDate
        label="Date de naissance du salarié"
        userBirthDate={userBirthDate}
        setUserBirthDate={setUserBirthDate}
      />

      <Select
        label="Nationalité du salarié"
        nativeSelectProps={{
          onChange: e => setUserNationality(e.target.value),
          value: userNationality,
          name: "userNationality"
        }}
        required
      >
        {COUNTRIES.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <CompanyControlData
        siren={siren}
        setSiren={setSiren}
        companyName={companyName}
        setCompanyName={setCompanyName}
        companyAddress={companyAddress}
        setCompanyAddress={setCompanyAddress}
        showErrors={canSubmitForm}
      />

      <Select
        label="Type d'activité"
        nativeSelectProps={{
          onChange: e => setBusinessType(e.target.value),
          value: businessType
        }}
        required
      >
        {!businessType && (
          <option value="" disabled>
            Non renseigné
          </option>
        )}
        {BUSINESS_TYPES.map(businessType => (
          <option key={businessType.value} value={businessType.value}>
            {businessType.label}
          </option>
        ))}
      </Select>

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
          name="isDayPageFilled"
          options={[
            {
              label: "Oui",
              nativeInputProps: {
                checked: isDayPageFilled === true,
                onChange: () => setIsDayPageFilled(true)
              }
            },
            {
              label: "Non",
              nativeInputProps: {
                checked: isDayPageFilled === false,
                onChange: () => setIsDayPageFilled(false)
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
          Créer le contrôle
        </Button>
        <Button onClick={() => onClose()} priority="secondary">
          Annuler
        </Button>
      </Stack>
    </Stack>
  );
}
