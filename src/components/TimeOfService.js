import React from 'react';
import {formatTimer} from "../utils/time";


export function TimeOfService ({ timer }) {
    return (
        <div className="time-of-service-container">
            <h2>Temps de service : </h2>
            <h2>{formatTimer(timer)}</h2>
        </div>
    )
}
