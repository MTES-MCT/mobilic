import React from "react";
import Typography from "@mui/material/Typography";
import { InfoItem } from "../../../home/InfoField";
import {
  formatDateTime,
  frenchFormatDateStringOrTimeStamp
} from "common/utils/time";

export function ControllerControlHistory({ controlTime, tokenInfo }) {
  return (
    <div>
      <Typography variant="h6" component="h2">
        Historique récent (28 jours)
      </Typography>
      <Typography>
        {frenchFormatDateStringOrTimeStamp(tokenInfo.historyStartDay)} -{" "}
        {frenchFormatDateStringOrTimeStamp(tokenInfo.creationDay)}
      </Typography>
      <InfoItem
        name="Heure de contrôle"
        value={formatDateTime(controlTime || tokenInfo.creationTime, true)}
        uppercaseTitle={false}
        titleProps={{
          component: "h3"
        }}
      />
    </div>
  );
}
