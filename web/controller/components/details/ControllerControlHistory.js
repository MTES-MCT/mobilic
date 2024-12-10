import React from "react";
import Typography from "@mui/material/Typography";
import { InfoItem } from "../../../home/InfoField";
import { formatDateTime, formatDay } from "common/utils/time";
import { FieldTitle } from "../../../common/typography/FieldTitle";
import { Stack } from "@mui/material";

export function ControllerControlHistory({ controlTime, tokenInfo }) {
  return (
    <Stack rowGap={1}>
      <>
        <Typography variant="h6" component="h2" sx={{ lineHeight: "0.5rem" }}>
          Historique récent (28 jours)
        </Typography>
        <FieldTitle>
          Du{" "}
          {formatDay(
            new Date(tokenInfo.historyStartDay).getTime() / 1000,
            true
          )}{" "}
          au {formatDay(tokenInfo.creationTime, true)}
        </FieldTitle>
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
