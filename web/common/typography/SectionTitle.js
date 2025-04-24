import React from "react";
import { Typography } from "@mui/material";

export const SectionTitle = ({ title, ...otherProps }) => {
  return (
    <Typography
      fontSize="1.125rem"
      marginBottom={1}
      align="left"
      className="bold"
      {...otherProps}
    >
      {title}
    </Typography>
  );
};
