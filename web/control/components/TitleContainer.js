import Stack from "@mui/material/Stack";
import React from "react";

export const TitleContainer = ({ children }) => (
  <Stack
    direction="row"
    justifyContent={{ xs: "space-between", md: "flex-start" }}
    alignItems="center"
    mb={1}
    columnGap={2}
  >
    {children}
  </Stack>
);
