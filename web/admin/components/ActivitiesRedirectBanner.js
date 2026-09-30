import React from "react";
import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { makeStyles } from "@mui/styles";
import { readCookie, setCookie } from "common/utils/cookie";

const BANNER_FIRST_SEEN_COOKIE = "activitiesBannerFirstSeen";
const BANNER_DISMISSED_COOKIE = "activitiesBannerDismissed";
const COOKIE_EXPIRATION_DAYS = 30;
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const useStyles = makeStyles(() => ({
  banner: {
    width: "100%",
    "& .fr-container": {
      maxWidth: "100%"
    },
    "& .fr-notice__title": {
      fontWeight: 400
    },
    "& .fr-notice__link": {
      fontWeight: 700
    }
  }
}));

export function ActivitiesRedirectBanner() {
  const classes = useStyles();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (readCookie(BANNER_DISMISSED_COOKIE) === "true") {
      return;
    }
    let firstSeenAt = parseInt(readCookie(BANNER_FIRST_SEEN_COOKIE));
    if (!firstSeenAt) {
      firstSeenAt = Date.now();
      setCookie(
        BANNER_FIRST_SEEN_COOKIE,
        firstSeenAt.toString(),
        COOKIE_EXPIRATION_DAYS,
        true
      );
    }
    if (Date.now() - firstSeenAt < THREE_DAYS_MS) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setCookie(BANNER_DISMISSED_COOKIE, "true", COOKIE_EXPIRATION_DAYS, true);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Notice
      className={classes.banner}
      severity="info"
      isClosable
      onClose={handleClose}
      title="Dès aujourd'hui, validez les missions de vos salariés directement depuis la rubrique"
      link={{
        linkProps: { to: "/admin/activities", target: "_self" },
        text: "Activités"
      }}
    />
  );
}
