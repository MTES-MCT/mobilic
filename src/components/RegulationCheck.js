import React from 'react';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/Warning';
import ScheduleIcon from '@material-ui/icons/Schedule';
import Typography from "@material-ui/core/Typography";
import {RULE_RESPECT_STATUS} from "../utils/regulation";
import Box from "@material-ui/core/Box";


export function RegulationCheck ({check}) {
    let color;
    let icon;
    let emoji;
    if (check.status === RULE_RESPECT_STATUS.success) {
        color = "success.main";
        icon = (props) => <CheckIcon {...props}/>;
        emoji = "👏";
    }
    else if (check.status === RULE_RESPECT_STATUS.pending) {
        color = "warning.main";
        icon = (props) => <ScheduleIcon {...props}/>;
        emoji = "🙂";
    }
    else {
        color = "error.main";
        icon = (props) => <WarningIcon {...props}/>;
        emoji = "😢";
    }
    return (
        <Box color={color} className="regulation-check">
            {icon({className: "regulation-check-icon", color: "inherit", fontSize: "small"})}
            <Typography variant="body2" color="inherit" className="regulation-check-message">
                {check.message}<span className="non-italic">{` ${emoji}`}</span>
            </Typography>
        </Box>
    )
}
