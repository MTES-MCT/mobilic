import React from "react";
import { AccordionDetails, Stack } from "@mui/material";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import { formatDay } from "common/utils/time";
import Notice from "../../common/Notice";
import { getWorkerValidationForUser } from "common/utils/mission";
import { JUSTIFICATIONS } from "../../admin/modals/OverrideValidationJustificationModal";
import { makeStyles } from "@mui/styles";

export const useStyles = makeStyles((theme) => ({
  sucessDetails: {
    color: theme.palette.success.main
  },
  warningDetails: {
    color: theme.palette.warning.main
  }
}));

const EmployeeValidation = ({ validation }) => {
  const classes = useStyles();
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
    <Accordion label={label} className={`success notice-title`}>
      <AccordionDetails className={classes.sucessDetails}>
        {description}
      </AccordionDetails>
    </Accordion>
  ) : (
    <Notice
      title={label}
      type="success"
      lessPadding
      withBorders
      className="notice-title"
    />
  );
};

const NoEmployeeValidation = () => (
  <Notice
    title="Validation par le salarié en attente"
    type="warning"
    withBorders
    lessPadding
    className="notice-title"
  />
);

const AdminAutoValidation = ({ validation }) => {
  const classes = useStyles();
  return (
    <Accordion
      label={`Validée automatiquement à la place du gestionnaire le ${formatDay(
        validation.receptionTime,
        true
      )}`}
      className={`success notice-title`}
    >
      <AccordionDetails className={classes.sucessDetails}>
        La validation automatique s'effectue au plus tard 2 jours ouvrés après
        la validation du salarié.
      </AccordionDetails>
    </Accordion>
  );
};
const AdminManualValidation = ({ validation, hasOverriden }) => {
  const classes = useStyles();
  if (hasOverriden) {
    return (
      <Accordion
        label="Modifiée par le gestionnaire après validation automatique"
        className="warning notice-title"
      >
        <AccordionDetails className={classes.warningDetails}>
          Le gestionnaire a modifié la mission après sa validation pour la
          raison suivante :{" "}
          {JUSTIFICATIONS.find(
            (justification) => justification.key === validation.justification
          )?.label?.replace(/^./, (c) => c.toLowerCase())}
          .
        </AccordionDetails>
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
      className="notice-title"
    />
  );
};

const NoAdminValidation = () => (
  <Notice
    title="Validation par un gestionnaire en attente"
    type="warning"
    withBorders
    lessPadding
    className="notice-title"
  />
);

export const MissionValidations = ({ mission, validations, userId }) => {
  const doNotDisplayValidations = mission.isDeleted && !mission.complete;

  if (doNotDisplayValidations) {
    return;
  }

  const employeeValidation = getWorkerValidationForUser(
    mission.validations,
    userId
  );

  const adminValidations = (validations ?? []).filter(
    (v) => v.isAdmin && (!v.userId || v.userId === userId)
  );
  const adminAutoValidation = adminValidations.find(
    (validation) => validation.isAuto
  );
  const adminManualValidation = adminValidations.find(
    (validation) => !validation.isAuto
  );
  return (
    <Stack direction="column" textAlign="left">
      {employeeValidation ? (
        <EmployeeValidation validation={employeeValidation} />
      ) : (
        <NoEmployeeValidation />
      )}
      {adminAutoValidation && (
        <AdminAutoValidation validation={adminAutoValidation} />
      )}
      {adminManualValidation && (
        <AdminManualValidation
          validation={adminManualValidation}
          hasOverriden={!!adminAutoValidation}
        />
      )}
      {!adminAutoValidation && !adminManualValidation && <NoAdminValidation />}
    </Stack>
  );
};
