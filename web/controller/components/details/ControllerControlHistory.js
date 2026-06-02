import React from "react";
import Typography from "@mui/material/Typography";
import { formatDay } from "common/utils/time";
import { Description } from "../../../common/typography/Description";
import { Stack } from "@mui/material";

const controlHistoryDepth =
  process.env.REACT_APP_USER_CONTROL_HISTORY_DEPTH || 28;

export function ControllerControlHistory({
  tokenInfo
}) {
  return (
    <Stack rowGap={1}>
      <>
        <Typography variant="h6" component="h2" sx={{ lineHeight: "0.5rem" }}>
          Les {controlHistoryDepth} derniers jours
        </Typography>
        <Description noMargin>
          Depuis le {" "}
          {formatDay(
            new Date(tokenInfo.historyStartDay).getTime() / 1000,
            true
          )}
        </Description>
      </>
    </Stack>
  );
}
