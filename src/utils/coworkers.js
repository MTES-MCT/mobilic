export function currentTeamMates (coworkers) {
    return coworkers.filter((member) => member.isInCurrentTeam);
}

export function formatCoworkerName (coworker) {
    return `${coworker.firstName} ${coworker.lastName}`
}
