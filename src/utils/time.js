export function formatTimer (timerDuration) {
    if (!timerDuration) return null;
    const timerDurationInMinutes = timerDuration / 60000 >> 0;
    const timerDurationInHours = timerDurationInMinutes / 60 >> 0;
    return `${timerDurationInHours}h ${addZero(timerDurationInMinutes % 60)}m`;
}

export function formatDate (unixDate) {
    const date = new Date(unixDate);
    return `${addZero(date.getHours())}:${addZero(date.getMinutes() % 60)}`;
}

export function formatDay(unixDate) {
    const date = new Date(unixDate);
    return `${addZero(date.getDay())}/${addZero(date.getMonth())}`
}

function addZero (n) {
    return n < 10 ? '0' + n : n;
}
