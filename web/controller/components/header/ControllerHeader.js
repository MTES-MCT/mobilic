import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import useTheme from "@mui/styles/useTheme";
import { useIsWidthUp } from "common/utils/useWidth";
import { ControllerMobileHeader } from "./ControllerMobileHeader";
import { ControllerDesktopHeader } from "./ControllerDesktopHeader";

export function ControllerHeader() {
  const isMdUp = useIsWidthUp("md");
  const theme = useTheme();
  return (
    <Box
      px={2}
      className="header-container"
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <Box py={1}>
        {isMdUp ? <ControllerDesktopHeader /> : <ControllerMobileHeader />}
      </Box>
      <Divider className="full-width-divider hr-unstyled" />
    </Box>
  );
}
