import React from "react";
import Container from "@mui/material/Container";

export const Main = ({ maxWidth = "xl", sx = {}, children, ...otherProps }) => (
  <Container
    component="main"
    role="main"
    id="content"
    maxWidth={maxWidth}
    sx={{
      ...sx,
      padding: { xs: 0, md: "initial" }
    }}
    {...otherProps}
  >
    {children}
  </Container>
);
