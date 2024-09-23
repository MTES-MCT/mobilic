import React from "react";
import { Input as InputDsfr } from "@codegouvfr/react-dsfr/Input";
import { fr } from "@codegouvfr/react-dsfr";

export const Input = React.forwardRef(
  ({ required, label, nativeInputProps, ...props }, ref) => {
    const augmentedLabel =
      required && label ? (
        <>
          {label}{" "}
          <span
            style={{
              color: fr.colors.decisions.text.label.redMarianne.default
            }}
          >
            {" "}
            *
          </span>
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