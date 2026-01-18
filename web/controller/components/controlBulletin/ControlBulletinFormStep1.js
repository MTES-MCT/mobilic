import React from "react";

import Stack from "@mui/material/Stack";
import { COUNTRIES } from "../../utils/country";
import { DEPARTMENTS } from "../../utils/departments";
import { DsfrAutocomplete } from "../utils/DsfrAutocomplete";
import { MandatoryField } from "../../../common/MandatoryField";
import { Input } from "../../../common/forms/Input";
import { Select } from "../../../common/forms/Select";
import { BirthDate } from "../../../common/forms/BirthDate";
import { 
  MunicipalityAutocomplete,
  LocationAutocomplete 
} from "../../../common/LocationAutocomplete";

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  const [departmentCode, setDepartmentCode] = React.useState(null);

  function editControlBulletinField(newValue, fieldName) {
    handleEditControlBulletin({
      target: {
        name: fieldName,
        value: newValue
      }
    });
  }

  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <MandatoryField />
      <DsfrAutocomplete
        field={controlBulletin.locationDepartment}
        fieldLabel="Département du contrôle"
        options={DEPARTMENTS}
        showErrors={showErrors}
        searchByCodeAndLabel={true}
        onChange={(_, newValue) => {
          // Save the entire department object as JSON string
          editControlBulletinField(JSON.stringify(newValue), "locationDepartment");
          editControlBulletinField("", "locationCommune");
          editControlBulletinField("", "locationLieu");
          setDepartmentCode(newValue?.code);
        }}
      />
      
      {/* Municipality autocomplete with Géoplateforme API */}
      <MunicipalityAutocomplete
        value={controlBulletin.locationCommune || ""}
        onChange={(newValue) => {
          editControlBulletinField(newValue, "locationCommune");
          if (!newValue) {
            editControlBulletinField("", "locationLieu");
          }
        }}
        departmentCode={departmentCode}
        label="Commune du contrôle"
        required={true}
        disabled={!controlBulletin.locationDepartment}
        showErrors={showErrors}
      />
      
      {/* Location autocomplete with Géoplateforme API (POI and addresses) */}
      <LocationAutocomplete
        value={controlBulletin.locationLieu || ""}
        onChange={(newValue) => {
          editControlBulletinField(newValue, "locationLieu");
        }}
        departmentCode={departmentCode}
        label="Lieu du contrôle"
        required={true}
        disabled={!controlBulletin.locationCommune}
        showErrors={showErrors}
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.userLastName || "",
          onChange: (e) => handleEditControlBulletin(e),
          name: "userLastName"
        }}
        label="Nom du salarié"
        state={
          !controlBulletin.userLastName && showErrors ? "error" : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.userFirstName || "",
          onChange: (e) => handleEditControlBulletin(e),
          name: "userFirstName"
        }}
        label="Prénom du salarié"
        state={
          !controlBulletin.userFirstName && showErrors ? "error" : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      />
      <BirthDate
        label="Date de naissance du salarié"
        userBirthDate={controlBulletin.userBirthDate}
        setUserBirthDate={(newDateString) =>
          editControlBulletinField(newDateString, "userBirthDate")
        }
      />
      <Select
        label="Nationalité du salarié"
        nativeSelectProps={{
          onChange: (e) => handleEditControlBulletin(e),
          value: controlBulletin.userNationality || "",
          name: "userNationality"
        }}
        state={
          !controlBulletin.userNationality && showErrors ? "error" : "default"
        }
        stateRelatedMessage="Veuillez compléter ce champ."
        required
      >
        <option value="" disabled>
          Sélectionnez une nationalité
        </option>
        {COUNTRIES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Stack>
  );
}
