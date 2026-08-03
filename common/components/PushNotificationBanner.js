import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { makeStyles } from "@mui/styles";
import { usePushNotifications } from "common/hooks/usePushNotifications";

const useStyles = makeStyles(() => ({
  banner: {
    display: "flex",
    alignItems: "flex-start",
    padding: 16,
    gap: 8,
    backgroundColor: "#E8EDFF"
  },
  content: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flex: 1
  },
  text: {
    fontWeight: 500,
    fontSize: "0.875rem",
    lineHeight: "1.5rem",
    color: "#0063CB"
  },
  close: {
    flexShrink: 0,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 8,
    color: "#000091",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
}));

export default function PushNotificationBanner() {
  const classes = useStyles();
  const { shouldShowOptIn, requestPermission, dismiss } =
    usePushNotifications();

  if (!shouldShowOptIn) return null;

  return (
    <Box className={classes.banner}>
      <Box className={classes.content}>
        <Typography className={classes.text}>
          Pour recevoir des informations de la part de Mobilic,
          cliquez sur le bouton suivant :
        </Typography>
        <Button
          iconId="fr-icon-notification-3-line"
          size="small"
          onClick={requestPermission}
        >
          Activer les notifications
        </Button>
      </Box>
      <button
        className={classes.close}
        onClick={dismiss}
        aria-label="Fermer"
      >
        <span
          className="fr-icon-close-line fr-icon--sm"
          aria-hidden="true"
        />
      </button>
    </Box>
  );
}
