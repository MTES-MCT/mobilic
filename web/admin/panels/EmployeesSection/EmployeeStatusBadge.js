import React from "react";
import { makeStyles } from "@mui/styles";
import { fr } from "@codegouvfr/react-dsfr";
import { Tooltip } from "@codegouvfr/react-dsfr/Tooltip";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { WarningBadge } from "../../../common/WarningBadge";
import { frenchFormatDateStringOrTimeStamp } from "common/utils/time";
import {
  formatLastActiveDate,
  NEVER_USED_MOBILIC_LABEL
} from "common/utils/employeeStatus";

const useStyles = makeStyles(() => ({
  badgeDetache: {
    backgroundColor: fr.colors.decisions.background.contrast.grey.default,
    color: fr.colors.decisions.text.mention.grey.default,
    cursor: "default"
  },
  badgeCursor: {
    cursor: "default"
  }
}));

const EmployeeStatusBadge = ({ isDetached, isInactive, lastActiveAt, endDate }) => {
  const classes = useStyles();

  if (isDetached) {
    return (
      <Tooltip title={`Détaché depuis le ${frenchFormatDateStringOrTimeStamp(endDate)}`}>
        <Badge noIcon small className={classes.badgeDetache}>
          {"détaché".toUpperCase()}
        </Badge>
      </Tooltip>
    );
  }
  if (lastActiveAt === null) {
    return (
      <Tooltip title={NEVER_USED_MOBILIC_LABEL}>
        <WarningBadge className={classes.badgeCursor}>
          {"inactif".toUpperCase()}
        </WarningBadge>
      </Tooltip>
    );
  }
  if (isInactive) {
    return (
      <Tooltip title={`Aucun temps de travail saisi depuis le ${formatLastActiveDate(lastActiveAt)}. Pensez à détacher ce salarié.`}>
        <WarningBadge className={classes.badgeCursor}>
          {"inactif".toUpperCase()}
        </WarningBadge>
      </Tooltip>
    );
  }
  return null;
};

export default EmployeeStatusBadge;
