import { getTime, sortEvents } from "./events";

export function formatPersonName(coworker) {
  return `${coworker.firstName} ${coworker.lastName}`;
}

export function getCoworkerById(id, coworkers) {
  for (let i = 0; i < coworkers.length; i++) {
    const cw = coworkers[i];
    if (cw.id && id === cw.id) return cw;
  }
}

export function augmentCoworkersWithEnrollmentHistoryAtTime(
  time,
  storeSyncedWithLocalStorage,
  ignoreEnrollmentsBeforeTime = null
) {
  const teamEnrollmentsAtTime = sortEvents(
    storeSyncedWithLocalStorage
      .teamEnrollments()
      .filter(
        enrollment =>
          getTime(enrollment) < time &&
          (!ignoreEnrollmentsBeforeTime ||
            getTime(enrollment) >= ignoreEnrollmentsBeforeTime)
      )
  );
  const coworkers = storeSyncedWithLocalStorage
    .coworkers()
    .map(cw => ({ ...cw }));

  teamEnrollmentsAtTime.forEach(enrollment => {
    const matchingCoworker = coworkers.find(cw =>
      enrollment.userId
        ? enrollment.userId === cw.id
        : enrollment.firstName === cw.firstName &&
          enrollment.lastName === cw.lastName
    );
    if (!matchingCoworker) return;
    matchingCoworker.latestEnrollmentType = enrollment.type;
    matchingCoworker.latestEnrollmentTime = getTime(enrollment);
  });
  return coworkers;
}

export function resolveTeamAt(
  time,
  storeSyncedWithLocalStorage,
  ignoreEnrollmentsBeforeTime = null
) {
  return augmentCoworkersWithEnrollmentHistoryAtTime(
    time,
    storeSyncedWithLocalStorage,
    ignoreEnrollmentsBeforeTime
  ).filter(cw => cw.latestEnrollmentType === "enroll");
}
