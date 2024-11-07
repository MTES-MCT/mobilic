import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { useIsWidthUp } from "common/utils/useWidth";
import { ControllerMobileHeader } from "./ControllerMobileHeader";
import { ControllerDesktopHeader } from "./ControllerDesktopHeader";
import { HeaderComponent } from "../../../common/Header";

export function ControllerHeader() {
  const isMdUp = useIsWidthUp("md");
  return (
    <HeaderComponent>
      <Box py={1}>
        {isMdUp ? <ControllerDesktopHeader /> : <ControllerMobileHeader />}
      </Box>
      <Divider className="full-width-divider hr-unstyled" />
    </HeaderComponent>
  );
}
