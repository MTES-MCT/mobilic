import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {formatDate} from "../utils/time";
import classNames from 'classnames';
import {ACTIVITIES} from "../utils/activities";


const useStyles = makeStyles({
    period: props => ({
        width: props.width,
        backgroundColor: props.color,
    }),
    point: props => ({
        height: props.height,
    })
});

function Period ({width, color, className, children=null}) {
    const classes = useStyles({width, color});
    return (
        <div className={classNames("timeline-segment", classes.period, className)}>{children}</div>
    );
}

function Event({height, className, children=null}) {
    const classes = useStyles({height});
    return (
        <div className={classNames("timeline-point", classes.point, className)}>{children}</div>
    );
}

export function TimeLine ({dayEvents}) {
    const periodWidth = `${Math.floor((100 - dayEvents.length)/ dayEvents.length)}%`;
    return (
        <div className="timeline-container">
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event className="timeline-legend" />
                        <Period width={periodWidth} color={"blue"} className="timeline-legend">
                            {ACTIVITIES[event.activityName].renderIcon({className: "timeline-legend-icon"})}
                        </Period>
                    </React.Fragment>
                )}
            </div>
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event />
                        <Period width={periodWidth} color={"blue"} className={index === dayEvents.length - 1 && "timeline-segment-blurred"}/>
                    </React.Fragment>
                )}
            </div>
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event className="timeline-legend" >
                            <p className="timeline-legend-label">{formatDate(event.date)}</p>
                        </Event>
                        <Period width={periodWidth} className="timeline-legend"/>
                    </React.Fragment>
                )}
            </div>
        </div>
    )
}

