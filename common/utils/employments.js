export const EMPLOYMENT_STATUS = {
  active: "active",
  ended: "ended",
  future: "future",
  pending: "pending"
};

export function getEmploymentsStatus(employment) {
  if (!employment.isAcknowledged) return EMPLOYMENT_STATUS.pending;

  const today = new Date().toISOString().slice(0, 10);
  if (employment.startDate > today) return EMPLOYMENT_STATUS.future;
  if (employment.endDate && employment.endDate < today)
    return EMPLOYMENT_STATUS.ended;
  return EMPLOYMENT_STATUS.active;
}

export function orderEmployments(employments) {
  return employments.sort((e1, e2) => {
    const status1 = getEmploymentsStatus(e1);
    const status2 = getEmploymentsStatus(e2);

    if (
      status1 === EMPLOYMENT_STATUS.ended &&
      status2 !== EMPLOYMENT_STATUS.ended
    )
      return 1;
    if (
      status1 !== EMPLOYMENT_STATUS.ended &&
      status2 === EMPLOYMENT_STATUS.ended
    )
      return -1;
    return e1.startDate < e2.startDate ? 1 : -1;
  });
}
