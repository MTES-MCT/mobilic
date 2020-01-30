import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {formatDate, formatTimer} from "../utils/time";
import classNames from 'classnames';
import {ACTIVITIES} from "../utils/activities";
import Typography from "@material-ui/core/Typography";
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';

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

export function TimeLine ({title, dayEvents}) {
    const periodWidth = `${Math.floor((100 - dayEvents.length)/ dayEvents.length)}%`;
    return (
        <div className="timeline-container">
            <Typography variant="h6" className="timeline-title">
                Horaires réels
            </Typography>
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event className="timeline-legend" />
                        <Period width={periodWidth} color={"blue"} className="timeline-legend">
                            {ACTIVITIES[event.activityName].renderIcon()}
                        </Period>
                    </React.Fragment>
                )}
            </div>
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event />
                        <Period width={periodWidth} color={"blue"} className={index === dayEvents.length - 1 && "timeline-segment-blurred"}/>
                        {index === dayEvents.length - 1 &&
                            <ChevronRightOutlinedIcon fontSize="small" color="primary" className="timeline-line-end-arrow"/>
                        }
                    </React.Fragment>
                )}
            </div>
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event className="timeline-legend" >
                            <Typography variant="caption" className="timeline-legend-label">{formatDate(event.date)}</Typography>
                        </Event>
                        <Period width={periodWidth} className="timeline-legend"/>
                    </React.Fragment>
                )}
            </div>
        </div>
    )
}

