import React from "react";
import Typography from "@mui/material/Typography";
import Notice from "./Notice";

const AlertEmailDelay = () => {
  return (
    <Notice
      sx={{ marginY: 2 }}
      style={{ paddingBottom: 0 }}
      type="warning"
      description={
        <>
          Il est possible que&nbsp;:
          <ul style={{ padding: 0 }}>
            <li>
              <Typography>
                l'email parvienne avec un léger délai, de l'ordre de quelques
                minutes normalement.
              </Typography>
            </li>
            <li>
              <Typography>
                l'email atterrisse dans votre courrier indésirable (spams).
              </Typography>
            </li>
          </ul>
        </>
      }
    />
  );
};

export default AlertEmailDelay;
