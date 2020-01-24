import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {formatTimer} from "../utils/time";

const useStyles = makeStyles({
    root: {
        display: "flex",
        direction: "row",
        alignItems: "center",
        marginLeft: "1vw",
        marginRight: "1vw"
    }
});

export function TimeOfService ({ timer }) {
    const classes = useStyles();
    return (
        <div className={classes.root}>
            <h2>Temps de service : </h2>
            <h2>{formatTimer(timer)}</h2>
        </div>
    )
}
