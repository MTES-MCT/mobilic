import React, { useState, useEffect, use } from "react";
import { makeStyles } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles(theme => ({
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
}));

export const LiveChat = ({ userId, userInfo }) => {
  const [displayIcon, setDisplayIcon] = useState(false);
  const classes = useStyles();
  const BREVO_CONV_ID = process.env.REACT_APP_BREVO_CONV_ID;

  const email = userInfo?.email ?? null;
  const firstName = userInfo?.firstName ?? null;
  const lastName = userInfo?.lastName ?? null;
  const phone = userInfo?.phoneNumber ?? null;

  const syncBrevoVisitorData = () => {
    if (!userId || !window.BrevoConversations) {
      return;
    }

    window.BrevoConversations("updateIntegrationData", {
      email,
      firstName,
      lastName,
      phone,
      mobilic_id: String(userId),
      metabase_link: `https://metabase.mobilic.beta.gouv.fr/dashboard/6?id=${userId}`,
    });
  };

  useEffect(() => {
    if (!BREVO_CONV_ID)
      return;

    window.BrevoConversationsID = BREVO_CONV_ID;
    window.BrevoConversationsSetup = {
      ...(window.BrevoConversationsSetup || {}),
      visitorId: userId ? String(userId) : undefined,
      onRendered: () => {
        setDisplayIcon(true);
        syncBrevoVisitorData();
      },
      zIndex: 600,
    };

    if (!window.BrevoConversations) {
      window.BrevoConversations = function (...args) {
        (window.BrevoConversations.q = window.BrevoConversations.q || []).push(args);
      };
    }

    const existingScript = document.querySelector(`script[src="https://conversations-widget.brevo.com/brevo-conversations.js"]`);

    if (existingScript) {
      return;
    }

    const script = document.createElement("script");
    script.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
    script.async = true;
    document.head?.appendChild(script);
  }, [BREVO_CONV_ID, userId]);

  useEffect(() => {
    syncBrevoVisitorData();
  }, [userId, email, firstName, lastName]);

  const hideChat = () => {
    if (window.BrevoConversations) {
      window.BrevoConversations("hide");
    }
    setDisplayIcon(false);
  };

  return (
    displayIcon &&
    (
      <>
        <IconButton className={classes.closeButton} onClick={hideChat}>
          <CloseIcon className={classes.closeIcon} />
        </IconButton>
      </>
    )
  );
};
