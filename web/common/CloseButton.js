import React from "react";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

export default function CloseButton({ onClick, className }) {
  return (
    <IconButton aria-label="Fermer" onClick={onClick} className={className}>
      <CloseIcon />
    </IconButton>
  );
}
