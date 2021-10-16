import React from "react";

export function useDateOrDateTimeRangeSelection({
  start,
  setStart,
  end,
  setEnd,
  minRangeSize,
  nullableBounds = false
}) {
  const isRangeInvalid = () => {
    if (!nullableBounds && (!start || !end)) {
      return true;
    }
    return (
      start && end && (minRangeSize ? start > end - minRangeSize : start > end)
    );
  };

  React.useEffect(() => {
    if (start && isRangeInvalid())
      setEnd(minRangeSize ? start + minRangeSize : start);
  }, [start]);

  React.useEffect(() => {
    if (end && isRangeInvalid())
      setStart(minRangeSize ? end - minRangeSize : end);
  }, [end]);
}
