import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import { makeStyles } from "@mui/styles";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

const BREVO_CONV_ID = process.env.REACT_APP_BREVO_CONV_ID;

const BREVO_Z_INDEX = 4000;
const CLOSE_BUTTON_Z_INDEX = BREVO_Z_INDEX + 10;
const CLOSE_BUTTON_SIZE = 20;
const CLOSE_BUTTON_BOTTOM = 68;
const CLOSE_BUTTON_OFFSET = 20;
const CLOSE_BUTTON_LEFT_OFFSET = 60;

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: "fixed",
    bottom: CLOSE_BUTTON_BOTTOM,
    backgroundColor: "grey",
    color: theme.palette.primary.contrastText,
    height: CLOSE_BUTTON_SIZE,
    width: CLOSE_BUTTON_SIZE,
    zIndex: CLOSE_BUTTON_Z_INDEX,
  },
  closeButtonRight: {
    right: CLOSE_BUTTON_OFFSET,
  },
  closeButtonLeft: {
    left: CLOSE_BUTTON_LEFT_OFFSET,
  },
  closeIcon: {
    fontSize: "1rem"
  },
}));

export const LiveChat = ({ userId, userInfo, position = 'br', open = false }) => {
  const [displayIcon, setDisplayIcon] = useState(false);
  const classes = useStyles();
  const brevoGlobal = globalThis;

  const email = userInfo?.email ?? null;
  const firstName = userInfo?.firstName ?? null;
  const lastName = userInfo?.lastName ?? null;
  const phone = userInfo?.phoneNumber ?? null;

  const syncBrevoVisitorData = () => {
    if (!brevoGlobal.BrevoConversations) {
      return;
    }

    brevoGlobal.BrevoConversations("updateIntegrationData", {
      email,
      firstName,
      lastName,
      phone,
      mobilic_id: userId ? String(userId) : null,
      metabase_link: userId ? `https://metabase.mobilic.beta.gouv.fr/dashboard/6?id=${userId}` : null,
    });
  };

  useEffect(() => {
    if (!BREVO_CONV_ID)
      return;

    const previousSetup = brevoGlobal.BrevoConversationsSetup;
    brevoGlobal.BrevoConversationsID = BREVO_CONV_ID;
    brevoGlobal.BrevoConversationsSetup = {
      ...(previousSetup ?? undefined),
      visitorId: userId ? String(userId) : undefined,
      onRendered: () => {
        setDisplayIcon(true);
        syncBrevoVisitorData();
      },
      zIndex: BREVO_Z_INDEX,
      buttonPosition: position,
    };

    if (!brevoGlobal.BrevoConversations) {
      brevoGlobal.BrevoConversations = function (...args) {
        const queue = brevoGlobal.BrevoConversations.q || [];
        brevoGlobal.BrevoConversations.q = queue;
        queue.push(args);
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

    return () => {
      document.head?.querySelector(`script[src="https://conversations-widget.brevo.com/brevo-conversations.js"]`)?.remove();
      brevoGlobal.BrevoConversations("hide");
      script?.remove();
      delete brevoGlobal.BrevoConversations;
      delete brevoGlobal.BrevoConversationsSetup;
      delete brevoGlobal.BrevoConversationsID;
    };
  }, [BREVO_CONV_ID]);

  useEffect(() => {
    syncBrevoVisitorData();
  }, [userId, userInfo]);

  useEffect(() => {
    if (!brevoGlobal.BrevoConversations) {
      return;
    }
    if (open) {
      brevoGlobal.BrevoConversations("expandWidget");
      setDisplayIcon(true);
    }
  }, [open]);


  const hideChat = () => {
    if (brevoGlobal.BrevoConversations) {
      brevoGlobal.BrevoConversations("hide");
    }
    setDisplayIcon(false);
  };

  if (!displayIcon)
    return null;

  return ReactDOM.createPortal(
    <IconButton 
      className={`${classes.closeButton} ${position === 'bl' ? classes.closeButtonLeft : classes.closeButtonRight}`} 
      onClick={hideChat}
    >
      <CloseIcon className={classes.closeIcon} />
    </IconButton>,
    document.body
  );
};

LiveChat.propTypes = {
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  userInfo: PropTypes.shape({
    email: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    phoneNumber: PropTypes.string,
  }),
  position: PropTypes.oneOf(["bl", "br"]),
  open: PropTypes.bool,
};
