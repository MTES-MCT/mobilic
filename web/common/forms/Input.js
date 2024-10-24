import React from "react";
import { Input as InputDsfr } from "@codegouvfr/react-dsfr/Input";
import { MandatorySuffix } from "./MandatorySuffix";

export const Input = React.forwardRef(
  ({ required, label, nativeInputProps, ...props }, ref) => {
    const augmentedLabel =
      required && label ? (
        <>
          {label} {<MandatorySuffix />}
        </>
      ) : (
        label
      );

    const augmentedNativeInputProps = {
      ...nativeInputProps,
      ...(required ? { required: true } : {})
    };
    return (
      <InputDsfr
        label={augmentedLabel}
        nativeInputProps={augmentedNativeInputProps}
        {...props}
        ref={ref}
      />
    );
  }
);
