import React from "react";
import { SimplerRegulationCheck } from "../pwa/components/SimplerRegulationCheck";

export const renderRegulationCheck = regulationCheck => (
  <SimplerRegulationCheck
    key={regulationCheck.type}
    regulationCheck={regulationCheck}
  />
);
