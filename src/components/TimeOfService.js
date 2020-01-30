import React from 'react';
import {formatTimer} from "../utils/time";
import Typography from "@material-ui/core/Typography";


export function TimeOfService ({ timer }) {
    return (
        <div className="time-of-service-container">
            <Typography variant="subtitle1" style={{fontWeight: "bold"}} gutterBottom>
                Temps de service  :  {formatTimer(timer)}
            </Typography>
        </div>
    )
}
