import Stack from "@mui/material/Stack";
import React from "react";

export const TitleContainer = ({ children, sx }) => (
  <Stack
    direction="row"
    justifyContent={{ xs: "space-between", md: "flex-start" }}
    alignItems="center"
    mb={1}
    columnGap={2}
    sx={sx}
  >
    {children}
  </Stack>
);
