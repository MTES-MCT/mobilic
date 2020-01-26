export function currentTeamMates (coworkers) {
    return coworkers.filter((member) => member.isInCurrentTeam);
}
