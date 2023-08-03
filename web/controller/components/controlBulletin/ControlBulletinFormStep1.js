import React from "react";

import Stack from "@mui/material/Stack";
import { Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";
import { DEPARTMENTS } from "../../utils/departments";
import { useApi } from "common/utils/api";
import { CONTROL_LOCATION_QUERY } from "common/utils/apiQueries";
import { DsfrAutocomplete } from "../utils/DsfrAutocomplete";

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  const [controlLocationCommunes, setControlLocationCommunes] = React.useState(
    []
  );
  const [controlLocationLabels, setControlLocationLabels] = React.useState([]);
  const [departmentLocations, setDepartmentLocations] = React.useState([]);

  const api = useApi();

  React.useEffect(async () => {
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
        const allCommunes = apiResponse.data.controlLocation
          .map(location => location.commune)
          .sort((a, b) => a.localeCompare(b));
        setControlLocationCommunes([...new Set(allCommunes)]);
      }
    }
  }, [controlBulletin.locationDepartment]);

  React.useEffect(async () => {
    if (controlBulletin.locationCommune && departmentLocations) {
      setControlLocationLabels(
        departmentLocations
          .filter(depLoc => depLoc.commune === controlBulletin.locationCommune)
          .sort((a, b) => a.label.localeCompare(b.label))
      );
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
      <DsfrAutocomplete
        field={controlBulletin.locationDepartment}
        fieldLabel="Département du contrôle"
        options={DEPARTMENTS}
        showErrors={showErrors}
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
      <TextInput
        value={controlBulletin.userLastName || ""}
        name="userLastName"
        onChange={e => handleEditControlBulletin(e)}
        label="Nom du salarié"
        required
        messageType={!controlBulletin.userLastName && showErrors ? "error" : ""}
      />
      <TextInput
        value={controlBulletin.userFirstName || ""}
        name="userFirstName"
        onChange={e => handleEditControlBulletin(e)}
        label="Prénom du salarié"
        required
        messageType={
          !controlBulletin.userFirstName && showErrors ? "error" : ""
        }
      />
      <TextInput
        value={controlBulletin.userBirthDate || ""}
        name="userBirthDate"
        onChange={e => handleEditControlBulletin(e)}
        label="Date de naissance du salarié"
        required
        type="date"
        messageType={
          !controlBulletin.userBirthDate && showErrors ? "error" : ""
        }
      />
      <Select
        label="Nationalité du salarié"
        selected={controlBulletin.userNationality}
        name="userNationality"
        required
        onChange={e => {
          handleEditControlBulletin(e);
        }}
        options={COUNTRIES}
        messageType={
          !controlBulletin.userNationality && showErrors ? "error" : ""
        }
      />
    </Stack>
  );
}
