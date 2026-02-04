import React from "react";
import { SimplerRegulationCheck } from "../pwa/components/SimplerRegulationCheck";

export const renderRegulationCheck = (
  regulationCheck,
  employeeView = false,
) => (
  <SimplerRegulationCheck
    key={regulationCheck.type}
    regulationCheck={regulationCheck}
    employeeView={employeeView}
  />
);
