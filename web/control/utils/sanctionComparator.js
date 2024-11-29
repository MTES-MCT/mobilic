export const sanctionComparator = (alert1, alert2) => {
  // Display "absence de LIC" first
  if (alert1.sanction === "NATINF 23103") return -1;
  if (alert2.sanction === "NATINF 23103") return 1;
  return alert1.sanction.localeCompare(alert2.sanction);
};
