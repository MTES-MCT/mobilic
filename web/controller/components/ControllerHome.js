import React from "react";
import Container from "@mui/material/Container";
import { ControllerHeader } from "./header/ControllerHeader";

export function ControllerHome() {
  return [
    <ControllerHeader key={0} />,
    <Container key={1}>SALUT LE CONTROLEUR</Container>
  ];
}
