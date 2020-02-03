import React from 'react';


export function PlaceHolder ({children}) {
    return (
        <div style={{flexGrow: 1, display: "flex", flexDirection: "column"}}>
            <div style={{flexGrow: 1}} />
            <div style={{flexShrink: 0}}>
                {children}
            </div>
            <div style={{flexGrow: 2}} />
        </div>
    )
}
