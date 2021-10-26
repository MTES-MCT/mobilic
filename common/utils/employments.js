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
