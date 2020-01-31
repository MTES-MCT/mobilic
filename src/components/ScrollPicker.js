import React from 'react';
import Picker from 'react-mobile-picker';


export function ScrollPicker ({name, values, value, setValue, height}) {
    const optionGroups = {};
    const valueGroups = {};
    optionGroups[name] = values;
    valueGroups[name] = value;
    return (
        <Picker
            optionGroups={optionGroups}
            valueGroups={valueGroups}
            onChange={(n, v) => setValue(v)}
            height={height}
        />
    )
}
