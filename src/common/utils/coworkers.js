export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

function getCoworkerById(id, coworkers) {
  for (let i = 0; i < coworkers.length; i++) {
    const cw = coworkers[i];
    if (cw.id && id === cw.id) return cw;
  }
}

export function resolveCurrentTeam(
  currentActivity,
  storeSyncedWithLocalStorage
) {
  const coworkers = storeSyncedWithLocalStorage.coworkers();
  return currentActivity
    ? currentActivity.team.map(tm =>
        tm.id
          ? tm.id === storeSyncedWithLocalStorage.userId()
            ? storeSyncedWithLocalStorage.userInfo()
            : getCoworkerById(tm.id, coworkers)
          : tm
      )
    : [];
}
