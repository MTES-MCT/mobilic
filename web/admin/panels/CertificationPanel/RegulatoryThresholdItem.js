import React from "react";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Box from "@mui/material/Box";
import { getThresholdConfig } from "./regulatoryThresholdConstants";

export default function RegulatoryThresholdItem({
  thresholdType = "",
  isCompliant = false,
  className = ""
}) {
  const thresholdConfig = getThresholdConfig(thresholdType);

  if (!thresholdConfig) {
    console.warn(`Unknown threshold type: ${thresholdType}`);
    return null;
  }

  const complianceStatusClass = isCompliant ? "success" : "error";
  const titleByComplianceStatus = isCompliant
    ? thresholdConfig.label
    : thresholdConfig.labelNonCompliant;

  return (
    <>
      <style>{`
        .regulatory-threshold-item .fr-accordion__btn::after {
          display: none !important;
        }
        .regulatory-threshold-item .fr-accordion__btn {
          padding-right: 1rem !important;
        }
      `}</style>
      <Box sx={{ marginY: 1 }} className={className}>
        <div
          style={{
            pointerEvents: "none"
          }}
          className="regulatory-threshold-item"
        >
          <Accordion
            label={titleByComplianceStatus}
            className={complianceStatusClass}
          >
            {thresholdConfig.explanation}
          </Accordion>
        </div>
      </Box>
    </>
  );
}
