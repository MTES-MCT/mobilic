import React, { useMemo } from "react";

import Stack from "@mui/material/Stack";
import { COUNTRIES } from "../../utils/country";
import { DEPARTMENTS } from "../../utils/departments";
import { useApi } from "common/utils/api";
import { CONTROL_LOCATION_QUERY } from "common/utils/apiQueries";
import { DsfrAutocomplete } from "../utils/DsfrAutocomplete";
import { Box, Grid } from "@mui/material";
import { CURRENT_YEAR } from "common/utils/time";
import { MandatoryField } from "../../../common/MandatoryField";
import { Input } from "../../../common/forms/Input";
import { Select } from "../../../common/forms/Select";

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

  const [dayState, setDayState] = React.useState("default");
  const [monthState, setMonthState] = React.useState("default");
  const [yearState, setYearState] = React.useState("default");
  const [dateState, setDateState] = React.useState("default");

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
    let hasError = false;
    if (year < MIN_BIRTH_DATE_YEAR || year > MAX_BIRTH_DATE_YEAR) {
      setYearState("error");
      hasError = true;
    } else {
      setYearState("default");
    }
    if (month < 1 || month > 12) {
      setMonthState("error");
      hasError = true;
    } else {
      setMonthState("default");
    }
    if (day < 1 || day > 31) {
      setDayState("error");
      hasError = true;
    } else {
      setDayState("default");
    }

    if (!hasError && day && month && year) {
      const date = new Date(year, month - 1, day, 10, 0, 0, 0);
      const validYear = date.getFullYear() === parseInt(year);
      const validMonth = date.getMonth() === parseInt(month - 1);
      const validDay = date.getDate() === parseInt(day);
      if (validYear && validMonth && validDay) {
        setDateState("default");
        const newDateString = date.toISOString().split("T")[0];
        editControlBulletinField(newDateString, "userBirthDate");
      } else {
        setDateState("error");
      }
    } else {
      setDateState("default");
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
        required
      />

      <Box
        sx={{ marginBottom: 4, maxWidth: "440px" }}
        role="group"
        aria-labelledby="date-naissance-salarie"
        aria-describedby="date-naissance-salarie-error"
        className={dateState === "error" ? "fr-input-group--error" : ""}
      >
        <label className="fr-label" id="date-naissance-salarie">
          Date de naissance du salarié
        </label>
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Input
              nativeInputProps={{
                value: day,
                onChange: e => setDay(e.target.value),
                onBlur: onValidateBirthDate,
                type: "number",
                inputMode: "numeric"
              }}
              type="number"
              label="Jour"
              hintText="Entre 1 et 31"
              required
              state={dayState}
              stateRelatedMessage="Jour invalide. Exemple : 14."
            />
          </Grid>
          <Grid item xs={3}>
            <Input
              nativeInputProps={{
                value: month,
                onChange: e => setMonth(e.target.value),
                onBlur: onValidateBirthDate,
                type: "number",
                inputMode: "numeric"
              }}
              label="Mois"
              hintText="Entre 1 et 12"
              required
              state={monthState}
              stateRelatedMessage="Mois invalide. Exemple : 12."
            />
          </Grid>
          <Grid item xs={6}>
            <Input
              nativeInputProps={{
                value: year,
                onChange: e => setYear(e.target.value),
                onBlur: onValidateBirthDate,
                type: "number",
                inputMode: "numeric"
              }}
              label="Année"
              hintText="Exemple : 1984"
              required
              state={yearState}
              stateRelatedMessage="Année invalide. Exemple : 1990."
            />
          </Grid>
        </Grid>
        {dateState === "error" && (
          <p id="date-naissance-salarie-error" className="fr-error-text">
            Date invalide : ce jour n'existe pas.
          </p>
        )}
      </Box>
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
        stateRelatedMessage={
          !controlBulletin.userNationality && showErrors
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
    </Stack>
  );
}
