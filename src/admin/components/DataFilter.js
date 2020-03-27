import React from "react";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import CancelIcon from "@material-ui/icons/Cancel";

export function DataFilter({ isActive, reset, children }) {
  return (
    <Box style={{ display: "flex", alignItems: "flex-start" }}>
      {children}
      {isActive && (
        <IconButton
          style={{ padding: 0 }}
          edge="start"
          color="secondary"
          onClick={reset}
        >
          <CancelIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
