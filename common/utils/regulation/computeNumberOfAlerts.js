import { getLatestAlertComputationVersion } from "./alertVersions";

export const computeNumberOfAlerts = computations =>
  computations.reduce(
    (total, item) =>
      total +
      getLatestAlertComputationVersion(
        item.regulationComputations
      ).regulationChecks.filter(regulationCheck => !!regulationCheck.alert)
        .length,
    0
  );
