import React from "react";
import { Input } from "../../common/forms/Input";
import { sirenValidationErrorMessage } from "../../common/utils/siren";

export function SirenInputField({
  siren,
  setSiren,
  error,
  setError,
  button,
  className
}) {
  return (
    <fieldset className="fr-fieldset" aria-label="Numéro SIREN">
      <div className="fr-fieldset__element">
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
      </div>
      <div className="fr-mt-n1v fr-fieldset__element">
        <a
          className="fr-link"
          target="_blank"
          rel="noopener noreferrer"
          href="https://annuaire-entreprises.data.gouv.fr/"
        >
          Trouvez facilement le numéro SIREN de votre entreprise
        </a>
      </div>
    </fieldset>
  );
}
