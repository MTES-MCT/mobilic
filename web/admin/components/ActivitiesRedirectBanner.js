import React from "react";
import { useHistory } from "react-router-dom";
import Link from "@mui/material/Link";
import Notice from "../../common/Notice";

const BANNER_FIRST_SEEN_KEY = "mobilic.activitiesBanner.firstSeenAt";
const BANNER_DISMISSED_KEY = "mobilic.activitiesBanner.dismissed";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

export function ActivitiesRedirectBanner() {
  const history = useHistory();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (localStorage.getItem(BANNER_DISMISSED_KEY) === "true") {
      return;
    }
    let firstSeenAt = Number(localStorage.getItem(BANNER_FIRST_SEEN_KEY));
    if (!firstSeenAt) {
      firstSeenAt = Date.now();
      localStorage.setItem(BANNER_FIRST_SEEN_KEY, firstSeenAt.toString());
    }
    if (Date.now() - firstSeenAt < THREE_DAYS_MS) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(BANNER_DISMISSED_KEY, "true");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <Notice
      type="info"
      onClose={handleClose}
      title={
        <>
          Dès aujourd'hui, validez les missions de vos salariés directement
          depuis la rubrique{" "}
          <Link
            component="button"
            type="button"
            onClick={() => history.push("/admin/activities")}
            sx={{ fontWeight: "inherit" }}
          >
            Activités
          </Link>
        </>
      }
    />
  );
}
