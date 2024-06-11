import React from "react";
import LaunchIcon from "@mui/icons-material/Launch";
import { Link } from "@mui/material";

export const ExternalLink = ({ url, text, title, withIcon = false }) => (
  <Link
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    sx={{ textUnderlineOffset: "0.25rem" }}
    title={text ? text : title}
  >
    {text ? text : url}
    {withIcon && (
      <LaunchIcon
        sx={{
          fontSize: "1rem",
          marginLeft: "0.2rem",
          verticalAlign: "middle",
          position: "relative",
          top: "-2px"
        }}
      />
    )}
  </Link>
);
