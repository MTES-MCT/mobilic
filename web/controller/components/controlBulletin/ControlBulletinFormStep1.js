import React, { useMemo } from "react";

import Stack from "@mui/material/Stack";
import { Col, Row, Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";
import { DEPARTMENTS } from "../../utils/departments";
import { useApi } from "common/utils/api";
import { CONTROL_LOCATION_QUERY } from "common/utils/apiQueries";
import { DsfrAutocomplete } from "../utils/DsfrAutocomplete";
import { Box } from "@mui/material";
import { CURRENT_YEAR } from "common/utils/time";

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  const [departmentLocations, setDepartmentLocations] = React.useState([]);

  const api = useApi();
  const [day, setDay] = React.useState(1);
  const [month, setMonth] = React.useState(1);
  const [year, setYear] = React.useState(1980);
  const [dayErrorMessage, setDayErrorMessage] = React.useState("");
  const [monthErrorMessage, setMonthErrorMessage] = React.useState("");
  const [yearErrorMessage, setYearErrorMessage] = React.useState("");

  React.useEffect(() => {
    const { userBirthDate } = controlBulletin;
    if (!userBirthDate) {
      return;
    }
    const date = new Date(userBirthDate);
    setYear(date.getFullYear());
    setMonth(date.getMonth() + 1);
    setDay(date.getDate());
  }, [controlBulletin]);

  React.useEffect(() => {
    setYearErrorMessage("");
    if (year < CURRENT_YEAR - 110 || year >= CURRENT_YEAR - 15) {
      setYearErrorMessage("Année invalide");
    }
  }, [year]);

  React.useEffect(() => {
    setMonthErrorMessage("");
    if (month < 1 || month > 12) {
      setMonthErrorMessage("Mois invalide");
    }
  }, [month]);

  React.useEffect(() => {
    setDayErrorMessage("");
    if (day < 1 || day > 31) {
      setDayErrorMessage("Jour invalide");
    }
  }, [day]);

  React.useEffect(() => {
    if (yearErrorMessage) {
      editControlBulletinField(undefined, "userBirthDate");
      return;
    }
    const date = new Date(year, month - 1, parseInt(day) + 1);
    if (!isNaN(date)) {
      const newDateString = date.toISOString().split("T")[0];
      if (newDateString !== controlBulletin.userBirthDate) {
        editControlBulletinField(newDateString, "userBirthDate");
      }
    }
  }, [day, month, year, yearErrorMessage]);

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
      }
    }
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
        messageType={
          !controlBulletin.userLastName && showErrors ? "error" : undefined
        }
      />
      <TextInput
        value={controlBulletin.userFirstName || ""}
        name="userFirstName"
        onChange={e => handleEditControlBulletin(e)}
        label="Prénom du salarié"
        required
        messageType={
          !controlBulletin.userFirstName && showErrors ? "error" : undefined
        }
      />
      <Box sx={{ marginBottom: 4, maxWidth: "400px" }}>
        <label className="fr-label">Date de naissance du salarié</label>
        <Row gutters>
          <Col n="3">
            <TextInput
              type="number"
              required
              value={day}
              onChange={e => setDay(e.target.value)}
              label="Jour"
              hint="Exemple: 14"
              message={dayErrorMessage}
              messageType={dayErrorMessage ? "error" : undefined}
            />
          </Col>
          <Col n="3">
            <TextInput
              type="number"
              required
              value={month}
              onChange={e => setMonth(e.target.value)}
              label="Mois"
              hint="Exemple: 12"
              message={monthErrorMessage}
              messageType={monthErrorMessage ? "error" : undefined}
            />
          </Col>
          <Col n="4">
            <TextInput
              type="number"
              required
              value={year}
              onChange={e => setYear(e.target.value)}
              label="Année"
              hint="Exemple: 1984"
              message={yearErrorMessage}
              messageType={yearErrorMessage ? "error" : undefined}
            />
          </Col>
        </Row>
      </Box>
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
          !controlBulletin.userNationality && showErrors ? "error" : undefined
        }
      />
    </Stack>
  );
}
