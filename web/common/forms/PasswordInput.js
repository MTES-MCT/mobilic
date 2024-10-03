import React from "react";
import { PasswordInput as PasswordInputDsfr } from "@codegouvfr/react-dsfr/blocks/PasswordInput";
import { MandatorySuffix } from "./MandatorySuffix";
import { PASSWORD_POLICY_RULES } from "common/utils/passwords";

export const PasswordInput = React.forwardRef(
  ({ required, label, nativeInputProps, displayMessages, ...props }, ref) => {
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
    const { value } = nativeInputProps;
    return (
      <PasswordInputDsfr
        label={augmentedLabel}
        nativeInputProps={augmentedNativeInputProps}
        {...props}
        className="fr-input-group"
        ref={ref}
        messages={
          displayMessages
            ? PASSWORD_POLICY_RULES.map(rule => {
                return {
                  message: rule.message,
                  severity: !value
                    ? "info"
                    : rule.validator(value)
                    ? "valid"
                    : "error"
                };
              })
            : []
        }
      />
    );
  }
);
