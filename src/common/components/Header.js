import useTheme from "@material-ui/core/styles/useTheme";
import React from "react";
import Box from "@material-ui/core/Box";
import Divider from "@material-ui/core/Divider";

export function Header(props) {
  const theme = useTheme();
  return (
    <Box
      px={2}
      className="header-container"
      style={{ backgroundColor: theme.palette.background.paper }}
    >
      <Box py={1} {...props}></Box>
      <Divider className="full-width-divider" />
    </Box>
  );
}
