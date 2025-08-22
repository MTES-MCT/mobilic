import { PERIOD_STATUSES } from "common/utils/history/computePeriodStatuses";
import React from "react";

export const getDayChip = (periodStatus, selected) => {
  if (periodStatus === PERIOD_STATUSES.notValidated) {
    return <ChipCurrent selected={selected} />;
  }
  if (periodStatus === PERIOD_STATUSES.notValidatedByAdmin) {
    return <ChipWait selected={selected} />;
  }
  if (periodStatus === PERIOD_STATUSES.fullyValidated) {
    return <ChipSuccess selected={selected} />;
  }
  return null;
};

const Chip = ({ iconId, selected, selectedSuffix }) => {
  const selectedClass = ` period-chip-${selectedSuffix}`;
  return (
    <span
      className={`${iconId} fr-icon-sm${selected ? "" : selectedClass}`}
      aria-hidden="true"
    ></span>
  );
};

const ChipSuccess = ({ selected }) => {
  return (
    <Chip
      iconId="fr-icon-success-fill"
      selected={selected}
      selectedSuffix="success"
    />
  );
};

const ChipWait = ({ selected }) => {
  return (
    <Chip
      iconId="fr-icon-time-fill"
      selected={selected}
      selectedSuffix="wait"
    />
  );
};

const ChipCurrent = ({ selected }) => {
  return (
    <Chip
      iconId="fr-icon-play-circle-fill"
      selected={selected}
      selectedSuffix="current"
    />
  );
};
