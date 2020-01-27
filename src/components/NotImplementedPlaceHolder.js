import React from 'react';
import Typography from "@material-ui/core/Typography";


export function NotImplementedPlaceHolder ({label}) {
    return (
        <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
            <div style={{flexGrow: 1}} />
            <div style={{flexShrink: 0}}>
                <Typography variant="h4">
                    👷‍♂️🚧👷‍♀️
                </Typography>
                <Typography variant="body2">
                    {label} en construction
                </Typography>
            </div>
            <div style={{flexGrow: 2}} />
        </div>
    )
}
