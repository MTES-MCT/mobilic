import React from "react";
import { formatDay } from "common/utils/time";
import Notice from "./Notice";

export function MissionValidationInfo({
  validation,
  isAdmin = false,
  className
}) {
  return (
    <Notice
      type={validation ? "success" : "warning"}
      description={
        <>
          {validation
            ? `validée ${
                isAdmin ? "par un gestionnaire" : "par le salarié"
              } le ${formatDay(validation.receptionTime, true)}`
            : `validation ${
                isAdmin ? "par un gestionnaire" : "par le salarié"
              } en attente`}
        </>
      }
      className={className}
    />
  );
}
