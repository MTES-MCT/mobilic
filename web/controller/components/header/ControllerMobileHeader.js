import React from "react";
import Box from "@mui/material/Box";
import { Logos } from "../../../common/Logos";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { ControllerNavigationMenu } from "./ControllerNavigationMenu";

export function ControllerMobileHeader({ disableMenu }) {
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
