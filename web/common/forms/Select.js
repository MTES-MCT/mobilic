import React from "react";
import { Select as SelectDsfr } from "@codegouvfr/react-dsfr/Select";
import { MandatorySuffix } from "./MandatorySuffix";

export const Select = React.forwardRef(
  ({ required, label, nativeSelectProps, ...props }, ref) => {
    const augmentedLabel =
      required && label ? (
        <>
          {label} {<MandatorySuffix />}
        </>
      ) : (
        label
      );

    const augmentedNativeSelectProps = {
      ...nativeSelectProps,
      ...(required ? { required: true } : {})
    };
    return (
      <SelectDsfr
        label={augmentedLabel}
        nativeSelectProps={augmentedNativeSelectProps}
        {...props}
        ref={ref}
      />
    );
  }
);
