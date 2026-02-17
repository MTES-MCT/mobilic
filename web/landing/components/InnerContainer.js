import React from "react";
import Container from "@mui/material/Container";

export const InnerContainer = ({ children }) => {
  return (
    <Container
      maxWidth={false}
      sx={{
        textAlign: "left",
        mx: "auto",
        py: { xs: 5, xl: 10 },
        px: { xs: 3, xl: 12 },
        maxWidth: "1440px",
      }}
    >
      {children}
    </Container>
  );
};
