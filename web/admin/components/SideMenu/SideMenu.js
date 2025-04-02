import React from "react";
import Stack from "@mui/material/Stack";
import { Menu } from "./Menu";
import { Cards } from "./Cards";

export function SideMenu({ views }) {
  return (
    <Stack
      direction="column"
      className={`side-menu-container`}
      justifyContent="space-between"
      mb={2}
    >
      <Menu views={views} />
      <Cards />
    </Stack>
  );
}
