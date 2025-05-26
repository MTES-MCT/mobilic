import React from "react";
import { Stack } from "@mui/material";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { formatDay } from "common/utils/time";
import Notice from "../../common/Notice";
import { getWorkerValidationForUser } from "common/utils/mission";
import { MOTIFS } from "../../admin/modals/OverrideValidationJustificationModal";

const EmployeeValidation = validation => {
  const label = validation.isAuto
    ? `Validée automatiquement à la place du salarié le ${formatDay(
        validation.receptionTime,
        true
      )}`
    : `Validée par le salarié le ${formatDay(validation.receptionTime, true)}`;

  const description = validation.isAuto
    ? "La validation automatique s'effectue 24 heures après le début de la mission si le salarié ne l'a pas validée avant."
    : "";

  return description ? (
    <Accordion label={label} className="success">
      {description}
    </Accordion>
  ) : (
    <Notice title={label} type="success" lessPadding withBorders />
  );
};

const NoEmployeeValidation = () => (
  <Notice
    title="Validation par le salarié en attente"
    type="warning"
    withBorders
    lessPadding
  />
);

const AdminAutoValidation = validation => (
  <Accordion
    label={`Validée automatiquement à la place du gestionnaire le ${formatDay(
      validation.receptionTime,
      true
    )}`}
    className="success"
  >
    La validation automatique s'effectue au plus tard 2 jours ouvrés après la
    validation du salarié.
  </Accordion>
);
const AdminManualValidation = (validation, hasOverriden) => {
  if (hasOverriden) {
    return (
      <Accordion
        label="Modifiée par le gestionnaire après validation automatique"
        className="warning"
      >
        Le gestionnaire a modifié la mission après sa validation pour la raison
        suivante :{" "}
        {MOTIFS.find(motif => motif.key === validation.justification)?.label}.
      </Accordion>
    );
  }
  return (
    <Notice
      title={`Validée par le gestionnaire le ${formatDay(
        validation.receptionTime,
        true
      )}`}
      type="success"
      lessPadding
      withBorders
    />
  );
};

const NoAdminValidation = () => (
  <Notice
    title="Validation par un gestionnaire en attente"
    type="warning"
    withBorders
    lessPadding
  />
);

export const MissionValidations = ({
  mission,
  validations,
  userId,
  justification
}) => {
  const doNotDisplayValidations = mission.isDeleted && !mission.complete;

  if (doNotDisplayValidations) {
    return;
  }

  const employeeValidation = getWorkerValidationForUser(
    mission.validations,
    userId
  );

  const adminValidations = validations.filter(
    v => v.isAdmin && (!v.userId || v.userId === userId)
  );
  const adminAutoValidation = adminValidations.find(
    validation => validation.isAuto
  );
  const adminManualValidation = adminValidations.find(
    validation => !validation.isAuto
  );
  return (
    <Stack direction="column" textAlign="left">
      {employeeValidation
        ? EmployeeValidation(employeeValidation)
        : NoEmployeeValidation()}
      {adminAutoValidation && AdminAutoValidation(adminAutoValidation)}
      {adminManualValidation &&
        AdminManualValidation(
          adminManualValidation,
          adminAutoValidation,
          justification
        )}
      {!adminAutoValidation && !adminManualValidation && NoAdminValidation()}
    </Stack>
  );
};
