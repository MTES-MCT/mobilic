import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {getActivityByName} from "../utils/activities";
import {formatDate} from "../utils/time";


const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        width: props => props.width
    },
    period: props => ({
        height: props.height,
        width: props.width,
        border: props.height === 0 ? "solid 1px" : "none",
        borderColor: props.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }),
    point: props => ({
        height: props.height,
        width: props.width,
        border: props.draw ? "solid 0.5vw black" : "none",
        borderRadius: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    })
});

function Period ({width, color, height=0, children=null}) {
    const classes = useStyles({width, height, color});
    return (
        <div className={classes.period}>{children}</div>
    );
}

function Event({height="1vw", width="1vw", draw=true, children=null}) {
    const classes = useStyles({height, width, draw});
    return (
        <div className={classes.point}>{children}</div>
    )
}

export function TimeLine ({width, height, dayEvents}) {
    const classes = useStyles({width});
    const periodWidth = `${Math.floor((100 - dayEvents.length)/ dayEvents.length)}%`;
    return (
        <div style={{display: "flex", justifyContent: "center"}}>
            <div>
                <div className={classes.root}>
                    {dayEvents.map((event, index) =>
                        <React.Fragment key={index}>
                            <Event height={height} width="2vw" draw={false} />
                            <Period width={periodWidth} color={"blue"} height={height}>
                                {getActivityByName(event.activityName).renderIcon({style:{fontSize: height, color: "blue"}})}
                            </Period>
                        </React.Fragment>
                    )}
                </div>
                <div className={classes.root}>
                    {dayEvents.map((event, index) =>
                        <React.Fragment key={index}>
                            <Event />
                            <Period width={periodWidth} color={"blue"} />
                        </React.Fragment>
                    )}
                </div>
                <div className={classes.root}>
                    {dayEvents.map((event, index) =>
                        <React.Fragment key={index}>
                            <Event height={height} width="2vw" draw={false} >
                                <p style={{fontSize: "50%"}}>{formatDate(event.date)}</p>
                            </Event>
                            <Period width={periodWidth} height={height} />
                        </React.Fragment>
                    )}
                </div>
            </div>
        </div>
    )
}

