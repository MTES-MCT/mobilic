import React from "react";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { MandatorySuffix } from "./forms/MandatorySuffix";

export const WAY_HEARD_OF_MOBILIC_CHOICES = [
  {
    value: "MAIL_MOBILIC",
    label: "Courriel de l'équipe Mobilic"
  },
  {
    value: "DURING_CONTROL",
    label: "Lors d'un contrôle"
  },
  {
    value: "PHONE_CALL",
    label: "Appel de l'équipe Mobilic"
  },
  {
    value: "MAIL_DREAL",
    label: "Courrier/courriel de la DREAL"
  },
  {
    value: "SOCIAL_NETWORK",
    label: "Sur les réseaux sociaux"
  },
  {
    value: "SEARCH_ENGINE",
    label: "Recherche internet"
  },
  {
    value: "WORD_OF_MOUTH",
    label: "Bouche à oreille"
  }
];

export const HEARD_OF_MOBILIC_OTHER_VALUE = "OTHER";

export function WayHeardOfMobilic({
  setWayHeardOfMobilicValue,
  otherInput,
  setOtherInput,
  error,
  required
}) {
  const [wayHeardOfMobilicSelect, setWayHeardOfMobilicSelect] = React.useState(
    ""
  );

  const handleRadioChange = event => {
    const newValue = event.target.value;
    setWayHeardOfMobilicSelect(newValue);

    if (newValue !== HEARD_OF_MOBILIC_OTHER_VALUE) {
      setOtherInput("");
      setWayHeardOfMobilicValue(newValue);
    } else {
      setWayHeardOfMobilicValue("");
    }
  };

  const handleOtherInputChange = event => {
    const value = event.target.value.trimStart();
    setOtherInput(value);
    setWayHeardOfMobilicValue(value);
  };

  return (
    <fieldset>
      <legend style={{ marginBottom: "1rem" }}>
        Comment avez-vous connu Mobilic ? <MandatorySuffix />
      </legend>
      <RadioButtons
        options={[
          ...WAY_HEARD_OF_MOBILIC_CHOICES.map(choice => ({
            value: choice.value,
            label: choice.label,
            nativeInputProps: { value: choice.value }
          })),
          {
            value: HEARD_OF_MOBILIC_OTHER_VALUE,
            label: "Autre",
            nativeInputProps: { value: HEARD_OF_MOBILIC_OTHER_VALUE }
          }
        ]}
        value={wayHeardOfMobilicSelect}
        required={required}
        state={error ? "error" : "default"}
        stateRelatedMessage={
          error && !wayHeardOfMobilicSelect
            ? "Veuillez sélectionner comment vous avez connu Mobilic"
            : undefined
        }
        onChange={handleRadioChange}
      />
      {wayHeardOfMobilicSelect === HEARD_OF_MOBILIC_OTHER_VALUE && (
        <Input
          label="Précisez"
          nativeInputProps={{
            value: otherInput,
            onChange: handleOtherInputChange,
            maxLength: 250
          }}
          state={error && !otherInput ? "error" : "default"}
          stateRelatedMessage={
            error && !otherInput ? "Veuillez préciser votre réponse" : undefined
          }
          required={required}
          style={{ marginTop: "1rem" }}
        />
      )}
    </fieldset>
  );
}
