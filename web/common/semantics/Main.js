import React from "react";
import Container from "@mui/material/Container";

export const Main = ({
  className,
  maxWidth = "xl",
  sx = {},
  style = {},
  children,
  ...otherProps
}) => (
  <Container
    component="main"
    role="main"
    id="content"
    className={className}
    maxWidth={maxWidth}
    style={style}
    sx={{
      ...sx,
      padding: { xs: 0, md: "initial" }
    }}
    {...otherProps}
  >
    {children}
  </Container>
);
