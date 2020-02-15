export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

export function getCoworkerById(id, coworkers) {
  for (let i = 0; i < coworkers.length; i++) {
    const cw = coworkers[i];
    if (cw.id && id === cw.id) return cw;
  }
}
