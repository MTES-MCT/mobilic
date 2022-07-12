import React from "react";
import Container from "@mui/material/Container";
import { ControllerHeader } from "./header/ControllerHeader";
import { useStoreSyncedWithLocalStorage } from "common/store/store";

export function ControllerHome() {
  const store = useStoreSyncedWithLocalStorage();
  const controllerUserInfo = store.controllerInfo();
  return [
    <ControllerHeader key={0} />,
    <Container key={1}>SALUT {controllerUserInfo.firstName} !</Container>
  ];
}
