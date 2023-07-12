import React from "react";
import Alert from "@mui/material/Alert";
import { formatDay } from "common/utils/time";

export function MissionValidationInfo({
  validation,
  isAdmin = false,
  className
}) {
  return (
    <Alert severity={validation ? "success" : "warning"} className={className}>
      {validation
        ? `validée ${
            isAdmin ? "par un gestionnaire" : "par le salarié"
          } le ${formatDay(validation.receptionTime, true)}`
        : `validation ${
            isAdmin ? "par un gestionnaire" : "par le salarié"
          } en attente`}
    </Alert>
  );
}
