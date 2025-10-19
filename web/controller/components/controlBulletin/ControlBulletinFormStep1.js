import React, { useMemo } from "react";

import Stack from "@mui/material/Stack";
import { COUNTRIES } from "../../utils/country";
import { DEPARTMENTS } from "../../utils/departments";
import { useApi } from "common/utils/api";
import { CONTROL_LOCATION_QUERY } from "common/utils/apiQueries";
import { DsfrAutocomplete } from "../utils/DsfrAutocomplete";
import { MandatoryField } from "../../../common/MandatoryField";
import { Input } from "../../../common/forms/Input";
import { Select } from "../../../common/forms/Select";
import { BirthDate } from "../../../common/forms/BirthDate";

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  const [departmentLocations, setDepartmentLocations] = React.useState([]);

  const api = useApi();

  React.useEffect(() => {
    const loadData = async () => {
      if (controlBulletin.locationDepartment) {
        const departmentCode = DEPARTMENTS.find(
          d => d.label === controlBulletin.locationDepartment
        )?.code;
        if (departmentCode) {
          const apiResponse = await api.graphQlQuery(
            CONTROL_LOCATION_QUERY,
            {
              department: departmentCode
            },
            { context: { nonPublicApi: true } }
          );
          setDepartmentLocations(apiResponse.data.controlLocation);
        }
      }
    };
    loadData();
  }, [controlBulletin.locationDepartment]);

  const controlLocationCommunes = useMemo(() => {
    if (departmentLocations) {
      const allCommunes = departmentLocations
        .map(location => location.commune)
        .sort((a, b) => a.localeCompare(b));
      return [...new Set(allCommunes)];
    } else {
      return [];
    }
  }, [departmentLocations]);

  const controlLocationLabels = useMemo(() => {
    if (controlBulletin.locationCommune && departmentLocations) {
      return departmentLocations
        .filter(depLoc => depLoc.commune === controlBulletin.locationCommune)
        .sort((a, b) => a.label.localeCompare(b.label));
    } else {
      return [];
    }
  }, [controlBulletin.locationCommune, departmentLocations]);

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
          editControlBulletinField(newValue.label, "locationDepartment");
          editControlBulletinField("", "locationCommune");
          editControlBulletinField("", "locationLieu");
        }}
      />
      <DsfrAutocomplete
        field={controlBulletin.locationCommune}
        fieldLabel="Commune du contrôle"
        disabled={!controlBulletin.locationDepartment}
        options={controlLocationCommunes}
        showErrors={showErrors}
        onChange={(_, newValue) => {
          editControlBulletinField(newValue, "locationCommune");
          editControlBulletinField("", "locationLieu");
        }}
      />
      <DsfrAutocomplete
        field={controlBulletin.locationLieu}
        fieldLabel="Lieu du contrôle"
        disabled={!controlBulletin.locationCommune}
        options={controlLocationLabels}
        showErrors={showErrors}
        onChange={(_, newValue) => {
          editControlBulletinField(newValue.label, "locationLieu");
          editControlBulletinField(newValue.id, "locationId");
        }}
      />
      <Input
        nativeInputProps={{
          value: controlBulletin.userLastName || "",
          onChange: e => handleEditControlBulletin(e),
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
          onChange: e => handleEditControlBulletin(e),
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
        setUserBirthDate={newDateString =>
          editControlBulletinField(newDateString, "userBirthDate")
        }
      />
      <Select
        label="Nationalité du salarié"
        nativeSelectProps={{
          onChange: e => handleEditControlBulletin(e),
          value: controlBulletin.userNationality,
          name: "userNationality"
        }}
        state={
          !controlBulletin.userNationality && showErrors ? "error" : "default"
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
    </Stack>
  );
}
