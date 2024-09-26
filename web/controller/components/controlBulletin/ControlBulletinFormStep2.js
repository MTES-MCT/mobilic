import React from "react";

import Stack from "@mui/material/Stack";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { COUNTRIES } from "../../utils/country";
import { CONTROL_BULLETIN_TRANSPORT_TYPE } from "../../utils/controlBulletin";
import { Input } from "../../../common/forms/Input";
import { Select } from "../../../common/forms/Select";
import { RadioButtons } from "../../../common/forms/RadioButtons";

export function ControlBulletinFormStep2({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <Input
        nativeInputProps={{
          value: controlBulletin.siren || "",
          name: "siren",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Entreprise responsable (de rattachement)"
        hintText="SIREN ou Numéro TVA"
        state={!controlBulletin.siren && showErrors ? "error" : "default"}
        required
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.companyName || "",
          name: "companyName",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Nom de l'entreprise"
        state={!controlBulletin.companyName && showErrors ? "error" : "default"}
        required
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.companyAddress || "",
          name: "companyAddress",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="Adresse de l'entreprise"
        state={
          !controlBulletin.companyAddress && showErrors ? "error" : "default"
        }
        required
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
        stateRelatedMessage={
          !controlBulletin.vehicleRegistrationCountry && showErrors
            ? "Veuillez compléter ce champ"
            : ""
        }
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
      <Input
        nativeInputProps={{
          value: controlBulletin.licenseNumber || "",
          name: "licenseNumber",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="N° de la licence"
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.licenseCopyNumber || "",
          name: "licenseCopyNumber",
          onChange: e => handleEditControlBulletin(e)
        }}
        label="N° de copie conforme de la licence"
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
