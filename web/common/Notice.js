import React from "react";
import Box from "@mui/material/Box";

export const Notice = props => (
  <Box
    className="fr-notice fr-notice--info"
    textAlign={{ xs: "left", md: "center" }}
    marginY={1}
  >
    <Box className="fr-container">
      <Box className="fr-notice__body">{props.children}</Box>
    </Box>
  </Box>
);
