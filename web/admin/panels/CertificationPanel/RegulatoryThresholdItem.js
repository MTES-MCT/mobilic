import React from "react";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Box from "@mui/material/Box";

export default function RegulatoryThresholdItem({ compliancyItem }) {
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
      <Box sx={{ marginY: 1 }}>
        <div
          style={{
            pointerEvents: "none"
          }}
          className="regulatory-threshold-item"
        >
          <Accordion
            label={
              compliancyItem.isOk
                ? compliancyItem.labelOk
                : compliancyItem.labelKo
            }
            className={compliancyItem.isOk ? "success" : "error"}
          />
        </div>
      </Box>
    </>
  );
}
