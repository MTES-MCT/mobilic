export const EMPLOYMENT_STATUS = {
  active: "active",
  ended: "ended",
  future: "future",
  pending: "pending",
  ceased: "ceased"
};

export const EMPLOYMENT_ROLE = {
  employee: "Travailleur mobile",
  admin: "Gestionnaire"
};

export function getEmploymentsStatus(employment) {
  if (employment.company?.hasCeasedActivity) return EMPLOYMENT_STATUS.ceased;
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

    const isCeasedOrEnded1 =
      status1 === EMPLOYMENT_STATUS.ended ||
      status1 === EMPLOYMENT_STATUS.ceased;
    const isCeasedOrEnded2 =
      status2 === EMPLOYMENT_STATUS.ended ||
      status2 === EMPLOYMENT_STATUS.ceased;

    if (isCeasedOrEnded1 && !isCeasedOrEnded2) return 1;
    if (isCeasedOrEnded2 && !isCeasedOrEnded1) return -1;
    return e1.startDate < e2.startDate ? 1 : -1;
  });
}
