import React, { useMemo } from "react";

import Stack from "@mui/material/Stack";
import { Select } from "@codegouvfr/react-dsfr/Select";
// import { Col, Row, Select, TextInput } from "@dataesr/react-dsfr";
import { COUNTRIES } from "../../utils/country";
import { DEPARTMENTS } from "../../utils/departments";
import { useApi } from "common/utils/api";
import { CONTROL_LOCATION_QUERY } from "common/utils/apiQueries";
import { DsfrAutocomplete } from "../utils/DsfrAutocomplete";
import { Box } from "@mui/material";
import { CURRENT_YEAR } from "common/utils/time";
import { MandatoryField } from "../../../common/MandatoryField";

const BIRTH_DATE_MIN_YEAR = 100;
const BIRTH_DATE_MAX_YEAR = 18;

export function ControlBulletinFormStep1({
  handleEditControlBulletin,
  controlBulletin,
  showErrors
}) {
  const [departmentLocations, setDepartmentLocations] = React.useState([]);

  const api = useApi();
  const [day, setDay] = React.useState();
  const [month, setMonth] = React.useState();
  const [year, setYear] = React.useState();

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

  const MAX_BIRTH_DATE_YEAR = React.useMemo(
    () => CURRENT_YEAR - BIRTH_DATE_MAX_YEAR,
    [CURRENT_YEAR]
  );
  const MIN_BIRTH_DATE_YEAR = React.useMemo(
    () => CURRENT_YEAR - BIRTH_DATE_MIN_YEAR,
    [CURRENT_YEAR]
  );

  const onValidateBirthDate = () => {
    const validYear = Math.max(
      MIN_BIRTH_DATE_YEAR,
      Math.min(year, MAX_BIRTH_DATE_YEAR)
    );
    const validMonth = Math.max(0, Math.min(month - 1, 11));
    const maxDay = validMonth === 1 ? 29 : 30;
    const validDay = Math.max(1, Math.min(parseInt(day), maxDay));
    const date = new Date(validYear, validMonth, validDay, 10, 0, 0, 0);
    if (!isNaN(date)) {
      const newDateString = date.toISOString().split("T")[0];
      editControlBulletinField(newDateString, "userBirthDate");
    }
  };

  const onChangeNDigits = (e, setter, n) => {
    const firstTwoChars = e.target.value.slice(0, n);
    if (!isNaN(firstTwoChars)) {
      setter(firstTwoChars);
    }
  };

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
      {/* <TextInput
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
      /> */}
      <Box
        sx={{ marginBottom: 4, maxWidth: "440px" }}
        role="group"
        aria-labelledby="date-naissance-salarie"
      >
        <label className="fr-label" id="date-naissance-salarie">
          Date de naissance du salarié
        </label>
        {/* <Row gutters>
          <Col n="3">
            <TextInput
              required
              value={day}
              inputMode="numeric"
              onChange={e => onChangeNDigits(e, setDay, 2)}
              onBlur={onValidateBirthDate}
              label="Jour"
              hint="Ex : 14"
            />
          </Col>
          <Col n="3">
            <TextInput
              inputMode="numeric"
              required
              value={month}
              onChange={e => onChangeNDigits(e, setMonth, 2)}
              onBlur={onValidateBirthDate}
              label="Mois"
              hint="Ex : 12"
            />
          </Col>
          <Col n="6">
            <TextInput
              inputMode="numeric"
              required
              value={year}
              onChange={e => onChangeNDigits(e, setYear, 4)}
              onBlur={onValidateBirthDate}
              label="Année"
              hint="Ex : 1984"
            />
          </Col>
        </Row> */}
      </Box>
      <Select
        label="Nationalité du salarié"
        nativeSelectProps={{
          onChange: e => handleEditControlBulletin(e),
          value: controlBulletin.userNationality,
          name: "userNationality",
          required: true
        }}
        state={
          !controlBulletin.userNationality && showErrors ? "error" : "default"
        }
        stateRelatedMessage={
          !controlBulletin.userNationality && showErrors
            ? "Veuillez compléter ce champ"
            : ""
        }
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
