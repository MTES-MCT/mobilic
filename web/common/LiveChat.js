import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Crisp } from "crisp-sdk-web";
import Button from "@mui/material/Button";

const useStyles = makeStyles(theme => ({
  chatButton: {
    textTransform: "none",
    position: "fixed",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 99,
    fontSize: "1.2rem",
    [theme.breakpoints.up("md")]: {
      right: theme.spacing(4),
      bottom: theme.spacing(4)
    }
  }
}));

export const LiveChat = () => {
  const [open, setOpen] = useState(true);
  const classes = useStyles();

  const openChat = () => {
    setOpen(false);
    Crisp.setColorTheme("blue");
    Crisp.chat.show();
    Crisp.chat.open();
  };

  return (
    open && (
      <Button
        size="small"
        color="primary"
        variant="contained"
        onClick={openChat}
        className={classes.chatButton}
      >
        Besoin d'aide ?
      </Button>
    )
  );
};
