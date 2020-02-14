export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

export function findDriverIndex(driver, teamMates) {
  for (let i = 0; i < teamMates.length; i++) {
    const user = teamMates[i];
    if (driver.id && user.id === driver.id) return i;
    if (
      driver.firstName &&
      driver.lastName &&
      driver.firstName === user.firstName &&
      driver.lastName === user.lastName
    )
      return i;
  }
  return -1;
}

export function getCoworkerById(id, coworkers) {
  for (let i = 0; i < coworkers.length; i++) {
    const cw = coworkers[i];
    if (cw.id && id === cw.id) return cw;
  }
}
