export function formatTimer (timerDuration) {
    if (!timerDuration) return null;
    const timerDurationInMinutes = timerDuration / 60000 >> 0;
    const timerDurationInHours = timerDurationInMinutes / 60 >> 0;
    return `${addZero(timerDurationInHours)}:${addZero(timerDurationInMinutes % 60)}`;
}

function addZero (n) {
    return n < 10 ? '0' + n : n;
}
