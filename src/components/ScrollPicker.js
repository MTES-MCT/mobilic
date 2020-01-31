import React from 'react';
import Picker from 'react-scrollable-picker';


export function ScrollPicker ({name, values, value, setValue, height, itemHeight}) {
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
            itemHeight={itemHeight}
        />
    )
}
