import React from "react";
import { Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles(theme => ({
  pictureButton: {
    width: 64,
    height: 64,
    borderRadius: "50%",
    backgroundColor: `${theme.palette.primary.main}B2`,
    "&:hover": { backgroundColor: theme.palette.primary.main },
    position: "absolute",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    border: "2px solid white"
  }
}));

export function TakePictureButton({ onClick, disabled = false }) {
  const classes = useStyles();

  return (
    <Button
      onClick={onClick}
      className={classes.pictureButton}
      disabled={disabled}
    />
  );
}
