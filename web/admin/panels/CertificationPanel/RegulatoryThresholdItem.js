import React from "react";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Box from "@mui/material/Box";

export default function RegulatoryThresholdItem({ compliancyItem }) {
  return (
    <Box
      sx={{ marginY: 1 }}
      style={{
        pointerEvents: "none"
      }}
      className="regulatory-threshold-item"
    >
      <Accordion
        label={
          compliancyItem.isOk ? compliancyItem.labelOk : compliancyItem.labelKo
        }
        className={compliancyItem.isOk ? "success" : "error"}
      />
    </Box>
  );
}
