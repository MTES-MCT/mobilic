import React from "react";
import Alert from "@mui/material/Alert";
import { formatDay } from "common/utils/time";

export function MissionValidationInfo({ validation, isAdmin = false }) {
  return (
    <Alert severity={validation ? "success" : "warning"}>
      {validation
        ? `validé ${
            isAdmin ? "par un gestionnaire" : "par le salarié"
          } le ${formatDay(validation.receptionTime, true)}`
        : `validation ${
            isAdmin ? "par un gestionnaire" : "par le salarié"
          } en attente`}
    </Alert>
  );
}
