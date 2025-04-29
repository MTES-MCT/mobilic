import React from "react";
import { Stack } from "@mui/material";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { formatDay } from "common/utils/time";

const EmployeeValidation = validation => {
  const label = validation.isAuto
    ? `Validée automatiquement à la place du salarié le ${formatDay(
        validation.receptionTime,
        true
      )}`
    : `Validée par le salarié le ${formatDay(validation.receptionTime, true)}`;
  return (
    <Accordion label={label} className="success">
      {validation.isAuto &&
        "La validation automatique s'effectue 24 heures après le début de la mission si le salarié ne l'a pas validée avant."}
    </Accordion>
  );
};

const NoEmployeeValidation = () => (
  <Accordion
    label="Validation par le salarié en attente"
    className="error"
  ></Accordion>
);

export const MissionValidations = ({ mission }) => {
  const employeeValidation = mission.validations.find(
    validation => !validation.isAdmin
  );
  return (
    <Stack direction="column" textAlign="left">
      {employeeValidation
        ? EmployeeValidation(employeeValidation)
        : NoEmployeeValidation()}
    </Stack>
  );
};
