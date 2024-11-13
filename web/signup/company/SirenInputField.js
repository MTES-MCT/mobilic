import React from "react";
import { Input } from "../../common/forms/Input";
import { sirenValidationErrorMessage } from "../../common/utils/siren";
import { SirenFieldset } from "../../common/forms/SirenFieldset";

export function SirenInputField({
  siren,
  setSiren,
  error,
  setError,
  button,
  className
}) {
  return (
    <SirenFieldset labelAnnuaire="Trouvez facilement le numéro SIREN de votre entreprise">
      <Input
        addon={button}
        label="Numéro SIREN"
        className={className}
        nativeInputProps={{
          value: siren,
          onChange: e => {
            const newSirenValue = e.target.value.replace(/\s/g, "");
            setSiren(newSirenValue);
            setError(sirenValidationErrorMessage(newSirenValue));
          }
        }}
        state={error ? "error" : "default"}
        stateRelatedMessage={error}
        classes={{
          nativeInputOrTextArea: "fr-mr-2v"
        }}
        required
      />
    </SirenFieldset>
  );
}
