import React from "react";
import Typography from "@mui/material/Typography";
import { InfoItem } from "../../../home/InfoField";
import { formatDateTime, formatDay } from "common/utils/time";
import { Description } from "../../../common/typography/Description";
import { Stack } from "@mui/material";

const controlHistoryDepth =
  process.env.REACT_APP_USER_CONTROL_HISTORY_DEPTH || 28;

export function ControllerControlHistory({ controlTime, tokenInfo }) {
  return (
    <Stack rowGap={1}>
      <>
        <Typography variant="h6" component="h2" sx={{ lineHeight: "0.5rem" }}>
          Historique récent ({controlHistoryDepth} jours)
        </Typography>
        <Description noMargin>
          Du{" "}
          {formatDay(
            new Date(tokenInfo.historyStartDay).getTime() / 1000,
            true
          )}{" "}
          au {formatDay(tokenInfo.creationTime, true)}
        </Description>
      </>
      <InfoItem
        name="Date et heure de contrôle"
        value={formatDateTime(controlTime || tokenInfo.creationTime, true)}
        uppercaseTitle={false}
        titleProps={{
          component: "h3"
        }}
      />
    </Stack>
  );
}
