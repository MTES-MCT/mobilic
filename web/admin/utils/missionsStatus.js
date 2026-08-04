import { entryDeleted, entryToBeValidatedByWorker, entryToBeValidatedByAdmin } from "../selectors/validationEntriesSelectors";

export const MISSION_STATUS = {
  ongoing: "Mission en cours",
  waitingWorker: "Mission à valider par le salarié",
  toValidateAdmin: "Mission à valider",
  validated: "Mission validée",
  allValidated: "Journée validée",
  deleted: "Mission supprimée"
};

export const computeMissionStatus = (
  validationEntries,
  currentUserId,
  {
    adminCanBypass = false,
    overrideValidationJustification = ""
  } = {}
) => {
  if (!Array.isArray(validationEntries) || validationEntries.length === 0) {
    return null;
  }
  if (currentUserId === null || currentUserId === undefined) {
    return null;
  }

  if (validationEntries.some((entry) => entryDeleted(entry))) {
    return MISSION_STATUS.deleted;
  }

  if (validationEntries.some((entry) => !entry.hasEndedMission)) {
    return MISSION_STATUS.ongoing;
  }

  if (validationEntries.some((entry) => entryToBeValidatedByWorker(entry))) {
    return MISSION_STATUS.waitingWorker;
  }

  if (
    validationEntries.some((entry) =>
      entryToBeValidatedByAdmin(
        entry,
        currentUserId,
        adminCanBypass,
        overrideValidationJustification
      )
    )
  ) {
    return MISSION_STATUS.toValidateAdmin;
  }

  if (validationEntries.some((entry) => entry.adminValidation)) {
    return MISSION_STATUS.validated;
  }

  return null;
};