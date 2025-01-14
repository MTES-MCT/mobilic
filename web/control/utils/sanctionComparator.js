const NO_LIC_NATINFS = ["NATINF 23103", "NATINF 25666"];

export const sanctionComparator = (alert1, alert2) => {
  // Display "absence de LIC" first
  if (NO_LIC_NATINFS.includes(alert1.sanction)) return -1;
  if (NO_LIC_NATINFS.includes(alert2.sanction)) return 1;
  return alert1.sanction.localeCompare(alert2.sanction);
};
