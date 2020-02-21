import useTheme from "@material-ui/core/styles/useTheme";
import React from "react";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";

export function Header(props) {
  const theme = useTheme();
  return (
    <Box
      className="header-container"
      style={{ backgroundColor: theme.palette.background.default }}
    >
      <Box {...props}></Box>
      <Divider className="full-width-divider" />
    </Box>
  );
}
