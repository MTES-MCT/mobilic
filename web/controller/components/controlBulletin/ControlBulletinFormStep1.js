import React from "react";

import Stack from "@mui/material/Stack";
import { Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";
import TextField from "@mui/material/TextField";
import { Autocomplete } from "@mui/material";
import { DEPARTMENTS } from "../../utils/departments";
import Typography from "@mui/material/Typography";
import { useApi } from "common/utils/api";
import { CONTROL_LOCATION_QUERY } from "common/utils/apiQueries";

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
          .map(loc => loc.label)
          .sort((a, b) => a.localeCompare(b))
      );
    }
  }, [controlBulletin.locationCommune, departmentLocations]);

  return (
    <Stack direction="column" p={2} sx={{ width: "100%" }}>
      <Typography
        mb={0.5}
        className={
          !controlBulletin.locationDepartment && showErrors
            ? "fr-label--error"
            : ""
        }
      >
        Département du contrôle {<sup style={{ color: "red" }}>*</sup>}
      </Typography>
      <Autocomplete
        disableClearable
        noOptionsText={"Aucune option disponible"}
        value={controlBulletin.locationDepartment || ""}
        size="small"
        options={DEPARTMENTS}
        onChange={(_, newValue) => {
          handleEditControlBulletin({
            target: {
              name: "locationDepartment",
              value: newValue.label
            }
          });
          handleEditControlBulletin({
            target: {
              name: "locationCommune",
              value: ""
            }
          });
          handleEditControlBulletin({
            target: {
              name: "locationLieu",
              value: ""
            }
          });
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="filled"
            hiddenLabel
            error={!controlBulletin.locationDepartment && showErrors}
          />
        )}
      />
      <Typography
        mb={0.5}
        mt={2}
        className={
          !controlBulletin.locationCommune && showErrors
            ? "fr-label--error"
            : ""
        }
      >
        Commune du contrôle {<sup style={{ color: "red" }}>*</sup>}
      </Typography>
      <Autocomplete
        disableClearable
        noOptionsText={"Aucune option disponible"}
        value={controlBulletin.locationCommune || ""}
        disabled={!controlBulletin.locationDepartment}
        size="small"
        options={controlLocationCommunes}
        onChange={(_, newValue) => {
          handleEditControlBulletin({
            target: {
              name: "locationCommune",
              value: newValue
            }
          });
          handleEditControlBulletin({
            target: {
              name: "locationLieu",
              value: ""
            }
          });
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="filled"
            hiddenLabel
            error={!controlBulletin.locationCommune && showErrors}
          />
        )}
      />
      <Typography
        mt={2}
        mb={0.5}
        className={
          !controlBulletin.locationLieu && showErrors ? "fr-label--error" : ""
        }
      >
        Lieu du contrôle {<sup style={{ color: "red" }}>*</sup>}
      </Typography>
      <Autocomplete
        style={{ marginBottom: "1.5rem" }}
        noOptionsText={"Aucune option disponible"}
        disableClearable
        value={controlBulletin.locationLieu || ""}
        disabled={!controlBulletin.locationCommune}
        size="small"
        options={controlLocationLabels}
        onChange={(_, newValue) => {
          handleEditControlBulletin({
            target: {
              name: "locationLieu",
              value: newValue
            }
          });
        }}
        renderInput={params => (
          <TextField
            {...params}
            variant="filled"
            hiddenLabel
            error={!controlBulletin.locationLieu && showErrors}
          />
        )}
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
