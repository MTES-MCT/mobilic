import React from "react";
import { Input } from "../../../common/forms/Input";
import {
  validateLicenseFormat,
  getLicensePlaceholder,
  getLicenseExample,
  getLicensePattern
} from "../../utils/licenseFormatter";

export function LicenseInput({ value, name, onChange, label, showErrors }) {
  const isInvalid = value && !validateLicenseFormat(value);
  const placeholder = getLicensePlaceholder();
  const example = getLicenseExample();
  const pattern = getLicensePattern();

  return (
    <Input
      nativeInputProps={{
        value,
        name,
        onChange,
        placeholder,
        inputMode: "text",
        pattern,
        maxLength: 15
      }}
      label={label}
      hint={`Format : ${placeholder} (ex: ${example})`}
      state={isInvalid && showErrors ? "error" : "default"}
      stateRelatedMessage={isInvalid ? "Format: aaaa/xx/xxxxxxx" : ""}
    />
  );
}
