import React from "react";
import { PasswordInput as PasswordInputDsfr } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { MandatorySuffix } from "./MandatorySuffix";

export const PasswordInput = React.forwardRef(
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
      <PasswordInputDsfr
        label={augmentedLabel}
        nativeInputProps={augmentedNativeInputProps}
        {...props}
        className="fr-input-group"
        ref={ref}
      />
    );
  }
);
