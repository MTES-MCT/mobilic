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
import { formatDateTimeLiteral } from "common/utils/time";

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

function activityChangeText(change) {
  const changeSentences = [];
  switch (change.type) {
    case "DELETE":
      return `a supprimé ${changeResourceAsText(
        change
      )} démarrée le ${formatDateTimeLiteral(change.before.startTime)}`;
    case "CREATE":
      return change.after.endTime
        ? `a ajouté ${changeResourceAsText(change)} du ${formatDateTimeLiteral(
            change.after.startTime
          )} au ${formatDateTimeLiteral(change.after.endTime)}`
        : `s'est mis en ${
            ACTIVITIES[change.after.type].label
          } le ${formatDateTimeLiteral(change.after.startTime)}`;
    case "UPDATE":
      if (change.after.endTime !== change.before.endTime) {
        if (!change.after.endTime) {
          changeSentences.push(
            `a repris ${changeResourceAsText(
              change
            )} le ${formatDateTimeLiteral(change.time)}`
          );
        } else if (!change.before.endTime) {
          changeSentences.push(
            `a mis fin à ${changeResourceAsText(
              change
            )} le ${formatDateTimeLiteral(change.after.endTime)}`
          );
        } else {
          changeSentences.push(
            `a décalé la fin de ${changeResourceAsText(
              change
            )} du ${formatDateTimeLiteral(
              change.before.endTime
            )} au ${formatDateTimeLiteral(change.after.endTime)}`
          );
        }
      }
      if (change.after.startTime !== change.before.startTime) {
        changeSentences.push(
          `a décalé le début de ${changeResourceAsText(
            change
          )} du ${formatDateTimeLiteral(
            change.before.startTime
          )} au ${formatDateTimeLiteral(change.after.startTime)}`
        );
      }
      return changeSentences;
    default:
      return [""];
  }
}

export function getChangeIconAndText(change) {
  switch (change.type) {
    case "DELETE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.activity:
          return [
            {
              icon: <HighlightOffIcon />,
              text: activityChangeText(change)
            }
          ];
        default:
          return [
            {
              icon: <HighlightOffIcon />,
              text: `a supprimé ${changeResourceAsText(change)}`
            }
          ];
      }
    case "CREATE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.validation:
          return [{ icon: <CheckIcon />, text: `a validé la mission` }];
        case MISSION_RESOURCE_TYPES.startLocation:
          return [
            {
              icon: <LocationOnIcon />,
              text: `a indiqué comme lieu de début de service : ${formatAddressMainText(
                change.after
              )} ${formatAddressSubText(change.after)}`
            }
          ];
        case MISSION_RESOURCE_TYPES.endLocation:
          return [
            {
              icon: <LocationOnIcon />,
              text: `a indiqué comme lieu de fin de service : ${formatAddressMainText(
                change.after
              )} ${formatAddressSubText(change.after)}`
            }
          ];
        case MISSION_RESOURCE_TYPES.activity:
          return [
            {
              icon: ACTIVITIES[change.after.type].renderIcon(),
              text: activityChangeText(change),
              color: ACTIVITIES[change.after.type].color
            }
          ];
        case MISSION_RESOURCE_TYPES.expenditure:
          return [
            {
              icon: <EuroIcon />,
              text: `a ajouté ${changeResourceAsText(change)}`
            }
          ];
        default:
          return [""];
      }
    case "UPDATE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.activity:
          return activityChangeText(change).map(text => ({
            icon: <EditIcon />,
            text: text
          }));
        default:
          return [""];
      }
    default:
      return [""];
  }
}
