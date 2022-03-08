import React from "react";
import { MISSION_RESOURCE_TYPES } from "common/utils/contradictory";
import { ACTIVITIES } from "common/utils/activities";
import { EXPENDITURES } from "common/utils/expenditures";
import { formatPersonName } from "common/utils/coworkers";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import HighlightOffIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import EuroIcon from "@mui/icons-material/Euro";
import EditIcon from "@mui/icons-material/Edit";

function changeResourceAsText(change) {
  switch (change.resourceType) {
    case MISSION_RESOURCE_TYPES.activity:
      return `l'activité ${
        ACTIVITIES[(change.after || change.before).type].label
      }`;
    case MISSION_RESOURCE_TYPES.expenditure:
      return `le frais ${
        EXPENDITURES[(change.after || change.before).type].label
      }`;
    case MISSION_RESOURCE_TYPES.startLocation:
      return `le lieu de début de service suivant : ${formatAddressMainText(
        change.after || change.before
      )} ${formatAddressSubText(change.after || change.before)}`;
    case MISSION_RESOURCE_TYPES.endLocation:
      return `le lieu de fin de service suivant : ${formatAddressMainText(
        change.after || change.before
      )} ${formatAddressSubText(change.after || change.before)}`;
    case MISSION_RESOURCE_TYPES.validation:
      return `la validation de ${formatPersonName(
        (change.after || change.before).submitter
      )}`;
    default:
      return "";
  }
}

function activityChangeText(change, datetimeFormatter) {
  switch (change.type) {
    case "DELETE":
      return `a supprimé ${changeResourceAsText(change)} ${
        change.before.endTime
          ? `de ${datetimeFormatter(
              change.before.startTime
            )} à ${datetimeFormatter(change.before.endTime)}`
          : `démarrée à ${datetimeFormatter(change.before.startTime)}`
      }`;
    case "CREATE":
      return change.after.endTime
        ? `a ajouté ${changeResourceAsText(change)} de ${datetimeFormatter(
            change.after.startTime
          )} à ${datetimeFormatter(change.after.endTime)}`
        : `s'est mis en ${
            ACTIVITIES[change.after.type].label
          } à ${datetimeFormatter(change.after.startTime)}`;
    case "UPDATE":
      return !change.after.endTime && !change.before.endTime
        ? `a décalé le début de ${changeResourceAsText(
            change
          )} de ${datetimeFormatter(
            change.before.startTime
          )} à ${datetimeFormatter(change.after.startTime)}`
        : change.before.endTime && !change.after.endTime
        ? `a repris ${changeResourceAsText(change)}`
        : !change.before.endTime && change.after.endTime
        ? `a mis fin à ${changeResourceAsText(change)} à ${datetimeFormatter(
            change.after.endTime
          )}`
        : `a modifié la période de ${changeResourceAsText(
            change
          )} de ${datetimeFormatter(
            change.before.startTime
          )} - ${datetimeFormatter(
            change.before.endTime
          )} à ${datetimeFormatter(
            change.after.startTime
          )} - ${datetimeFormatter(change.after.endTime)}`;
    default:
      return "";
  }
}

export function getChangeIconAndText(change, datetimeFormatter) {
  switch (change.type) {
    case "DELETE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.activity:
          return {
            icon: <HighlightOffIcon />,
            text: activityChangeText(change, datetimeFormatter)
          };
        default:
          return {
            icon: <HighlightOffIcon />,
            text: `a supprimé ${changeResourceAsText(change)}`
          };
      }
    case "CREATE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.validation:
          return { icon: <CheckIcon />, text: `a validé la mission` };
        case MISSION_RESOURCE_TYPES.startLocation:
          return {
            icon: <LocationOnIcon />,
            text: `a indiqué comme lieu de début de service : ${formatAddressMainText(
              change.after
            )} ${formatAddressSubText(change.after)}`
          };
        case MISSION_RESOURCE_TYPES.endLocation:
          return {
            icon: <LocationOnIcon />,
            text: `a indiqué comme lieu de fin de service : ${formatAddressMainText(
              change.after
            )} ${formatAddressSubText(change.after)}`
          };
        case MISSION_RESOURCE_TYPES.activity:
          return {
            icon: ACTIVITIES[change.after.type].renderIcon(),
            text: activityChangeText(change, datetimeFormatter)
          };
        case MISSION_RESOURCE_TYPES.expenditure:
          return {
            icon: <EuroIcon />,
            text: `a ajouté ${changeResourceAsText(change)}`
          };
        default:
          return "";
      }
    case "UPDATE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.activity:
          return {
            icon: <EditIcon />,
            text: activityChangeText(change, datetimeFormatter)
          };
        default:
          return "";
      }
  }
}
