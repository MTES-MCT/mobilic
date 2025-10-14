import React from "react";

import Stack from "@mui/material/Stack";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { COUNTRIES } from "../../utils/country";
import { CONTROL_BULLETIN_TRANSPORT_TYPE } from "../../utils/controlBulletin";
import { Input } from "../../../common/forms/Input";
import { Select } from "../../../common/forms/Select";
import { RadioButtons } from "../../../common/forms/RadioButtons";
import { CompanyControlData } from "../forms/CompanyControlData";
import { formatLicenseNumber } from "../../utils/licenseFormatter";
import { LicenseInput } from "./LicenseInput";

export function ControlBulletinFormStep2({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  const [prevLicenseNumber, setPrevLicenseNumber] = React.useState("");
  const [prevLicenseCopyNumber, setPrevLicenseCopyNumber] = React.useState("");

  const createFieldSetter = fieldName => value => {
    handleEditControlBulletin({
      target: { name: fieldName, value }
    });
  };

  const setSiren = createFieldSetter("siren");
  const setCompanyName = createFieldSetter("companyName");
  const setCompanyAddress = createFieldSetter("companyAddress");

  const createLicenseHandler = (fieldName, prevValue, setPrevValue) => e => {
    const formattedValue = formatLicenseNumber(e.target.value, prevValue);
    setPrevValue(formattedValue);
    handleEditControlBulletin({
      target: { name: fieldName, value: formattedValue }
    });
  };

  const handleLicenseNumberChange = createLicenseHandler(
    "licenseNumber",
    prevLicenseNumber,
    setPrevLicenseNumber
  );

  const handleLicenseCopyNumberChange = createLicenseHandler(
    "licenseCopyNumber",
    prevLicenseCopyNumber,
    setPrevLicenseCopyNumber
  );

  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <CompanyControlData
        siren={controlBulletin.siren}
        setSiren={setSiren}
        companyName={controlBulletin.companyName}
        setCompanyName={setCompanyName}
        companyAddress={controlBulletin.companyAddress}
        setCompanyAddress={setCompanyAddress}
        showErrors={showErrors}
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.vehicleRegistrationNumber || "",
          name: "vehicleRegistrationNumber",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Immatriculation du véhicule"
        state={
          !controlBulletin.vehicleRegistrationNumber && showErrors
            ? "error"
            : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
      <Select
        label="Pays d'immatriculation"
        nativeSelectProps={{
          onChange: e => handleEditControlBulletin(e),
          value: controlBulletin.vehicleRegistrationCountry || "",
          name: "vehicleRegistrationCountry"
        }}
        state={
          !controlBulletin.vehicleRegistrationCountry && showErrors
            ? "error"
            : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      >
        {COUNTRIES.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Input
        nativeInputProps={{
          value: controlBulletin.missionAddressBegin || "",
          name: "missionAddressBegin",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Provenance"
        state={
          !controlBulletin.missionAddressBegin && showErrors
            ? "error"
            : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.missionAddressEnd || "",
          name: "missionAddressEnd",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Destination"
        state={
          !controlBulletin.missionAddressEnd && showErrors ? "error" : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
      <RadioButtons
        legend="Type de transport"
        name="transportType"
        options={Object.values(CONTROL_BULLETIN_TRANSPORT_TYPE).map(
          ({ label, apiValue }) => ({
            label,
            nativeInputProps: {
              value: controlBulletin.transportType === apiValue,
              onChange: e =>
                handleEditControlBulletin({
                  target: {
                    name: "transportType",
                    value: apiValue
                  }
                })
            }
          })
        )}
        state={
          !controlBulletin.transportType && showErrors ? "error" : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.articlesNature || "",
          name: "articlesNature",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Nature de la marchandise"
      />
      <LicenseInput
        value={controlBulletin.licenseNumber || ""}
        name="licenseNumber"
        onChange={handleLicenseNumberChange}
        label="N° de la licence"
        showErrors={showErrors}
      />
      <LicenseInput
        value={controlBulletin.licenseCopyNumber || ""}
        name="licenseCopyNumber"
        onChange={handleLicenseCopyNumberChange}
        label="N° de copie conforme de la licence"
        showErrors={showErrors}
      />
      <Checkbox
        legend=""
        options={[
          {
            label: "J'ai immobilisé le véhicule",
            nativeInputProps: {
              checked: controlBulletin.isVehicleImmobilized,
              onChange: e =>
                handleEditControlBulletin({
                  target: {
                    name: "isVehicleImmobilized",
                    value: e.target.checked
                  }
                })
            }
          }
        ]}
      />
    </Stack>
  );
}
