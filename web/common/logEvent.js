import React from "react";
import { MISSION_RESOURCE_TYPES } from "common/utils/contradictory";
import {
  formatDateTime,
  formatTimeOfDay,
  getStartOfDay
} from "common/utils/time";
import { ACTIVITIES } from "common/utils/activities";
import { EXPENDITURES } from "common/utils/expenditures";
import { formatPersonName } from "common/utils/coworkers";
import {
  formatAddressMainText,
  formatAddressSubText
} from "common/utils/addresses";
import HighlightOffIcon from "@material-ui/icons/Close";
import CheckIcon from "@material-ui/icons/Check";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import EuroIcon from "@material-ui/icons/Euro";
import EditIcon from "@material-ui/icons/Edit";

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

export function getChangeIconAndText(change) {
  const datetimeFormatter =
    getStartOfDay(change.before?.startTime) ===
      getStartOfDay(change.before?.endTime) &&
    getStartOfDay(change.after?.startTime) ===
      getStartOfDay(change.after?.endTime) &&
    getStartOfDay(change.before?.startTime) ===
      getStartOfDay(change.after?.startTime)
      ? formatTimeOfDay
      : formatDateTime;

  switch (change.type) {
    case "DELETE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.activity:
          return {
            icon: <HighlightOffIcon />,
            text: `a supprimé ${changeResourceAsText(
              change
            )} de ${datetimeFormatter(
              change.before.startTime
            )} à ${datetimeFormatter(change.before.endTime)}`
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
            text: `a indiqué comme lieu de début de service ${formatAddressMainText(
              change.after
            )} ${formatAddressSubText(change.after)}`
          };
        case MISSION_RESOURCE_TYPES.endLocation:
          return {
            icon: <LocationOnIcon />,
            text: `a indiqué comme lieu de fin de service ${formatAddressMainText(
              change.after
            )} ${formatAddressSubText(change.after)}`
          };
        case MISSION_RESOURCE_TYPES.activity:
          return {
            icon: ACTIVITIES[change.after.type].renderIcon(),
            text: change.after?.endTime
              ? `a ajouté ${changeResourceAsText(
                  change
                )} de ${datetimeFormatter(
                  change.after.startTime
                )} à ${datetimeFormatter(change.after.endTime)}`
              : `est passé en ${
                  ACTIVITIES[change.after.type].label
                } à ${datetimeFormatter(change.after.startTime)}`
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
            text:
              !change.before.endTime && change.after.endTime
                ? `a terminé ${changeResourceAsText(
                    change
                  )} à ${datetimeFormatter(change.after.endTime)}`
                : `a modifié ${changeResourceAsText(
                    change
                  )} de ${datetimeFormatter(
                    change.before.startTime
                  )} - ${datetimeFormatter(
                    change.before.endTime
                  )} à ${datetimeFormatter(
                    change.after.startTime
                  )} - ${datetimeFormatter(change.after.endTime)}`
          };
        default:
          return "";
      }
  }
}
