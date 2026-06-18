import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { formatDay } from "common/utils/time";
import { getWorkerValidationForUser } from "common/utils/mission";
import { CheckCircleIcon } from "common/utils/icons";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const blueFrance = fr.colors.decisions.text.actionHigh.blueFrance.default;
const borderGrey = fr.colors.decisions.background.contrast.grey.default;

const useStyles = makeStyles(theme => ({
  row: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1.5),
    padding: `${theme.spacing(1.5)}px 0`,
    borderBottom: `1px solid ${borderGrey}`,
    "&:first-child": {
      borderTop: `1px solid ${borderGrey}`
    }
  },
  icon: {
    color: blueFrance,
    fontSize: "18px !important",
    flexShrink: 0
  },
  label: {
    color: blueFrance,
    fontSize: 14,
    fontWeight: 500,
    lineHeight: `${theme.spacing(3)}px`
  }
}));

function ValidationRow({ icon, label, classes }) {
  return (
    <Box className={classes.row}>
      {icon}
      <Typography className={classes.label}>{label}</Typography>
    </Box>
  );
}

export function AdminMissionValidations({ mission, validations, userId }) {
  const classes = useStyles();
  const doNotDisplayValidations = mission.isDeleted && !mission.complete;

  if (doNotDisplayValidations) {
    return null;
  }

  const employeeValidation = getWorkerValidationForUser(
    mission.validations,
    userId
  );

  const adminValidations = (validations ?? []).filter(
    v => v.isAdmin && (!v.userId || v.userId === userId)
  );
  const adminAutoValidation = adminValidations.find(v => v.isAuto);
  const adminManualValidation = adminValidations.find(v => !v.isAuto);

  const checkIcon = <CheckCircleIcon className={classes.icon} />;
  const waitIcon = <AccessTimeIcon className={classes.icon} />;

  return (
    <Box>
      {employeeValidation ? (
        <ValidationRow
          classes={classes}
          icon={checkIcon}
          label={
            employeeValidation.isAuto
              ? `Validé automatiquement à la place du salarié le ${formatDay(employeeValidation.receptionTime, true)}`
              : `Validé par le salarié le ${formatDay(employeeValidation.receptionTime, true)}`
          }
        />
      ) : (
        <ValidationRow
          classes={classes}
          icon={waitIcon}
          label="En attente de validation salarié"
        />
      )}
      {adminAutoValidation && (
        <ValidationRow
          classes={classes}
          icon={checkIcon}
          label={`Validé automatiquement à la place du gestionnaire le ${formatDay(adminAutoValidation.receptionTime, true)}`}
        />
      )}
      {adminManualValidation && (
        <ValidationRow
          classes={classes}
          icon={checkIcon}
          label={`Validé par le gestionnaire le ${formatDay(adminManualValidation.receptionTime, true)}`}
        />
      )}
      {!adminAutoValidation && !adminManualValidation && (
        <ValidationRow
          classes={classes}
          icon={waitIcon}
          label="En attente de validation gestionnaire"
        />
      )}
    </Box>
  );
}
