import React from "react";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import useTheme from "@mui/styles/useTheme";
import { useIsWidthUp } from "common/utils/useWidth";
import { Logos } from "../../../common/Logos";
import { ControllerNavigationMenu } from "./ControllerNavigationMenu";

function MobileHeader({ disableMenu }) {
  const [openNavDrawer, setOpenNavDrawer] = React.useState(false);

  return (
    <Box className="flex-row-space-between">
      <Logos leaveSpaceForMenu={!disableMenu} />
      {!disableMenu && [
        <IconButton
          aria-label="Menu"
          key={0}
          edge="end"
          onClick={() => setOpenNavDrawer(!openNavDrawer)}
        >
          <MenuIcon />
        </IconButton>,
        <ControllerNavigationMenu
          key={1}
          open={openNavDrawer}
          setOpen={setOpenNavDrawer}
        />
      ]}
    </Box>
  );
}

export function ControllerHeader() {
  const isMdUp = useIsWidthUp("md");
  const theme = useTheme();
  return (
    <Box
      px={2}
      className="header-container"
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <Box py={1}>{isMdUp ? <MobileHeader /> : <MobileHeader />}</Box>
      <Divider className="full-width-divider hr-unstyled" />
    </Box>
  );
}
