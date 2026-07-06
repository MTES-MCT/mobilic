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
      <Box component="header" role="banner" py={1} pl={2} pr={1} width="100%">
        {isMdUp ? <ControllerDesktopHeader /> : <ControllerMobileHeader />}
      </Box>
      <Divider className="full-width-divider hr-unstyled" />
    </HeaderComponent>
  );
}
