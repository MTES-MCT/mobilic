import React, { useState } from "react";
import { makeStyles } from "@mui/styles";
import { Crisp } from "crisp-sdk-web";
import CrispClosedChat from "common/assets/images/crisp_closed_chat.svg";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles(theme => ({
  chatButton: {
    position: "fixed",
    right: "24px",
    bottom: "20px",
    backgroundColor: "#1972F5",
    zIndex: 650,
    width: "60px",
    height: "60px",
    cursor: "pointer",
    borderRadius: "100%"
  },
  closeButton: {
    position: "fixed",
    right: "20px",
    bottom: "68px",
    backgroundColor: "grey",
    color: theme.palette.primary.contrastText,
    height: "20px",
    width: "20px",
    zIndex: 649
  },
  closeIcon: {
    fontSize: "1rem"
  },
  chatIcon: {
    backgroundImage: `url(${CrispClosedChat})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
    width: "33px",
    height: "28px",
    top: "18px",
    left: "13px",
    position: "absolute"
  }
}));

export const LiveChat = () => {
  const [open, setOpen] = useState(false);
  const [displayIcon, setDisplayIcon] = useState(true);
  const classes = useStyles();

  const openChat = () => {
    setOpen(true);
    Crisp.chat.show();
    Crisp.chat.open();
  };

  const hideChat = () => {
    setOpen(false);
    setDisplayIcon(false);
    Crisp.chat.hide();
  };

  return (
    !open &&
    displayIcon && (
      <>
        <IconButton className={classes.closeButton} onClick={hideChat}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
        <div role="button" className={classes.chatButton} onClick={openChat}>
          <span className={classes.chatIcon}></span>
        </div>
      </>
    )
  );
};
