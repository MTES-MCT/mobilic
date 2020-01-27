export const MILLISECONDS_IN_A_DAY = 86400000;
export const MILLISECONDS_IN_A_WEEK = 7 * 86400000;


export function formatTimer (timerDuration) {
    if (!timerDuration) return null;
    const timerDurationInMinutes = timerDuration / 60000 >> 0;
    const timerDurationInHours = timerDurationInMinutes / 60 >> 0;
    return `${timerDurationInHours}h${"\u00A0"}${addZero(timerDurationInMinutes % 60)}m`;
}

export function formatDate (unixDate) {
    const date = new Date(unixDate);
    return `${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDay(unixDate) {
    const date = new Date(unixDate);
    return `${addZero(date.getDate())}/${addZero(date.getMonth() + 1)}`
}

function addZero (n) {
    return n < 10 ? '0' + n : n;
}

export function getStartOfWeek (unixDate) {
    const date = new Date(unixDate);
    const dayOfWeek = date.getDay();
    const daysToSubstract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return Math.floor((unixDate - daysToSubstract * MILLISECONDS_IN_A_DAY) / MILLISECONDS_IN_A_DAY) * MILLISECONDS_IN_A_DAY;
}
