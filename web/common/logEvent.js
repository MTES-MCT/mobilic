import React from "react";
import { MISSION_RESOURCE_TYPES } from "common/utils/contradictory";
import { ACTIVITIES, getActivityLabelDependingOnMissionType } from "common/utils/activities";
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

export function isSplitEvent(event) {
  return !!(event.after?.context?.splitFrom || event.context?.splitFrom);
}

export function isSupportEvent(event) {
  if (event.type === "DELETE") {
    return !!event.before?.dismissContext?.is_support;
  }
  return !!(event.after?.context?.is_support);
}

export function getEventAuthorName(event) {
  if (isSupportEvent(event)) return "Mobilic (assistance utilisateur)";
  return event.submitter ? formatPersonName(event.submitter) : null;
}

function changeResourceAsText(change, allowOtherTask = false) {
  switch (change.resourceType) {
    case MISSION_RESOURCE_TYPES.activity:
      return `l'activité ${
        getActivityLabelDependingOnMissionType(
          (change.after || change.before).type,
          allowOtherTask
        )
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
    case MISSION_RESOURCE_TYPES.autoValidationAdmin:
    case MISSION_RESOURCE_TYPES.autoValidationEmployee:
      return `la validation de ${formatPersonName(
        (change.after || change.before).submitter
      )}`;
    default:
      return "";
  }
}

function activityChangeText(change, allowOtherTask = false) {
  const changeSentences = [];
  switch (change.type) {
    case "DELETE":
      return [
        "a supprimé l'activité"
      ];
    case "CREATE":
      if (isSplitEvent(change)) {
        const originalStart = change.after?.context?.originalStartTime || change.context?.originalStartTime;
        return originalStart
          ? [`a décalé le début de ${changeResourceAsText(change, allowOtherTask)} du ${formatDateTimeLiteral(originalStart)} au ${formatDateTimeLiteral(change.after.startTime)}`]
          : [`a scindé ${changeResourceAsText(change, allowOtherTask)} le ${formatDateTimeLiteral(change.after.startTime)}`];
      }
      if (!change.after.endTime) {
        return [
          isSupportEvent(change)
            ? `a lancé ${changeResourceAsText(change, allowOtherTask)}`
            : `s'est mis en ${
                getActivityLabelDependingOnMissionType(change.after.type, allowOtherTask)
              } le ${formatDateTimeLiteral(change.after.startTime)}`
        ];
      }
      return [
        "a ajouté l'activité"
      ];
    case "UPDATE":
      if (change.after.endTime !== change.before.endTime) {
        if (!change.after.endTime) {
          changeSentences.push(
            `a repris ${changeResourceAsText(
              change, allowOtherTask
            )} le ${formatDateTimeLiteral(change.time)}`
          );
        } else if (!change.before.endTime) {
          changeSentences.push(
            `a mis fin à ${changeResourceAsText(
              change, allowOtherTask
            )} le ${formatDateTimeLiteral(change.after.endTime)}`
          );
        } else {
          changeSentences.push(
            `a décalé la fin de ${changeResourceAsText(
              change, allowOtherTask
            )} du ${formatDateTimeLiteral(
              change.before.endTime
            )} au ${formatDateTimeLiteral(change.after.endTime)}`
          );
        }
      }
      if (change.after.startTime !== change.before.startTime) {
        changeSentences.push(
          `a décalé le début de ${changeResourceAsText(
            change, allowOtherTask
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

export function getChangeIconAndText(change, allowOtherTask = false) {
  switch (change.type) {
    case "DELETE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.activity:
          return activityChangeText(change, allowOtherTask).map(text => ({
            icon: <HighlightOffIcon />,
            text: text
          }));
        default:
          return [
            {
              icon: <HighlightOffIcon />,
              text: `a supprimé ${changeResourceAsText(change, allowOtherTask)}`
            }
          ];
      }
    case "CREATE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.validation:
          return [{ icon: <CheckIcon />, text: `a validé la mission` }];
        case MISSION_RESOURCE_TYPES.autoValidationAdmin:
          return [
            {
              icon: <CheckIcon />,
              text: `a validé la mission automatiquement à la place du gestionnaire`
            }
          ];
        case MISSION_RESOURCE_TYPES.autoValidationEmployee:
          return [
            {
              icon: <CheckIcon />,
              text: `a validé la mission automatiquement à la place du salarié`
            }
          ];
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
          return activityChangeText(change, allowOtherTask).map(text => ({
            icon: ACTIVITIES[change.after.type].renderIcon(),
            color: ACTIVITIES[change.after.type].color,
            text: text
          }));
        case MISSION_RESOURCE_TYPES.expenditure:
          return [
            {
              icon: <EuroIcon />,
              text: `a ajouté ${changeResourceAsText(change, allowOtherTask)}`
            }
          ];
        default:
          return [""];
      }
    case "UPDATE":
      switch (change.resourceType) {
        case MISSION_RESOURCE_TYPES.activity:
          return activityChangeText(change, allowOtherTask).map(text => ({
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
