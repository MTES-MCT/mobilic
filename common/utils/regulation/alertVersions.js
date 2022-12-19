import { SubmitterType } from "common/utils/regulation/alertTypes";

// Get alerts after admin validation if computed,
// after employee validation otherwise
export const getLatestAlertComputationVersion = regulationComputations =>
  getAlertComputationVersion(regulationComputations, SubmitterType.ADMIN) ||
  getAlertComputationVersion(regulationComputations, SubmitterType.EMPLOYEE);

export const getAlertComputationVersion = (
  regulationComputations,
  submitterType
) => regulationComputations.find(x => x.submitterType === submitterType);
