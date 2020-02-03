import React from 'react';
import {makeStyles} from "@material-ui/core/styles";
import {formatTimeOfDay} from "../utils/time";
import classNames from 'classnames';
import {ACTIVITIES} from "../utils/activities";
import Typography from "@material-ui/core/Typography";
import ChevronRightOutlinedIcon from '@material-ui/icons/ChevronRightOutlined';
import useTheme from "@material-ui/core/styles/useTheme";


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
    const theme = useTheme();
    const periodWidth = `${Math.floor((100 - dayEvents.length)/ dayEvents.length)}%`;
    return (
        <div className="timeline-container">
            <Typography variant="subtitle1" className="timeline-title" gutterBottom>
                Déroulé de la journée
            </Typography>
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event className="timeline-legend" />
                        <Period width={periodWidth} className="timeline-legend">
                            {ACTIVITIES[event.activityName].renderIcon({style: {color: index === dayEvents.length - 1 ? theme.palette.primary.main : theme.palette[event.activityName]}})}
                        </Period>
                        {index === dayEvents.length - 1 &&
                            <ChevronRightOutlinedIcon fontSize="small" color="primary" className="timeline-line-end-arrow hidden"/>
                        }
                    </React.Fragment>
                )}
            </div>
            <div className="timeline-line">
                {dayEvents.map((event, index) =>
                    <React.Fragment key={index}>
                        <Event />
                        <Period width={periodWidth} color={theme.palette[event.activityName]} className={index === dayEvents.length - 1 && "timeline-segment-blurred"}/>
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
                            <Typography variant="caption" className="timeline-legend-label">{formatTimeOfDay(event.date)}</Typography>
                        </Event>
                        <Period width={periodWidth} className="timeline-legend"/>
                        {index === dayEvents.length - 1 &&
                            <ChevronRightOutlinedIcon fontSize="small" color="primary" className="timeline-line-end-arrow hidden"/>
                        }
                    </React.Fragment>
                )}
            </div>
        </div>
    )
}

