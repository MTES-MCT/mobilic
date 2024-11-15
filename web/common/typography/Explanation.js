import Typography from "@mui/material/Typography";
import React from "react";

export const Explanation = ({ children, sx, style, ...otherProps }) => {
  return (
    <Typography
      sx={{ marginBottom: 2, ...sx }}
      style={{
        ...style,
        fontStyle: "italic",
        textAlign: "justify"
      }}
      {...otherProps}
    >
      {children}
    </Typography>
  );
};
