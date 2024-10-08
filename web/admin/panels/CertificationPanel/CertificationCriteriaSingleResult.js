import React from "react";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Box from "@mui/material/Box";

export default function CertificationCriteriaSingleResult({
  criteria,
  status
}) {
  return (
    <Box sx={{ marginY: 1 }}>
      <Accordion label={criteria.title} className={status}>
        {criteria.explanation}
      </Accordion>
    </Box>
  );
}
